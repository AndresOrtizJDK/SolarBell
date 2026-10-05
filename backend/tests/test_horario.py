from httpx import AsyncClient

TIMBRADO = {
    "label": "Recreo",
    "time": "09:30",
    "rings": 2,
    "ringSeconds": 4,
    "customDurations": None,
}


async def test_semilla_coincide_con_el_horario_del_frontend(
    cliente: AsyncClient, auth: dict[str, str]
) -> None:
    estado = (await cliente.get("/api/schedule", headers=auth)).json()
    assert estado["weekly"]["days"] == [1, 2, 3, 4, 5]
    assert [t["time"] for t in estado["weekly"]["bells"]] == ["08:00", "10:00", "12:00"]
    assert estado["specials"] == []


async def test_guardar_y_borrar_timbrado_semanal(
    cliente: AsyncClient, auth: dict[str, str]
) -> None:
    estado = (await cliente.put("/api/schedule/bells/b1", json=TIMBRADO, headers=auth)).json()
    horas = [t["time"] for t in estado["weekly"]["bells"]]
    assert horas == ["08:00", "09:30", "10:00", "12:00"]

    editado = {**TIMBRADO, "rings": 3, "customDurations": [1, 2, 3]}
    estado = (await cliente.put("/api/schedule/bells/b1", json=editado, headers=auth)).json()
    timbrado = next(t for t in estado["weekly"]["bells"] if t["id"] == "b1")
    assert timbrado["customDurations"] == [1, 2, 3]

    estado = (await cliente.delete("/api/schedule/bells/b1", headers=auth)).json()
    assert all(t["id"] != "b1" for t in estado["weekly"]["bells"])


async def test_validacion_del_timbrado(cliente: AsyncClient, auth: dict[str, str]) -> None:
    hora_invalida = {**TIMBRADO, "time": "25:00"}
    respuesta = await cliente.put("/api/schedule/bells/x", json=hora_invalida, headers=auth)
    assert respuesta.status_code == 422
    descuadre = {**TIMBRADO, "customDurations": [1]}
    respuesta = await cliente.put("/api/schedule/bells/x", json=descuadre, headers=auth)
    assert respuesta.status_code == 422
    demasiados = {**TIMBRADO, "rings": 11}
    respuesta = await cliente.put("/api/schedule/bells/x", json=demasiados, headers=auth)
    assert respuesta.status_code == 422


async def test_dias_de_la_semana(cliente: AsyncClient, auth: dict[str, str]) -> None:
    estado = (
        await cliente.put("/api/schedule/weekdays", json={"days": [5, 1, 1]}, headers=auth)
    ).json()
    assert estado["weekly"]["days"] == [1, 5]


async def test_flujo_de_fechas_especiales(cliente: AsyncClient, auth: dict[str, str]) -> None:
    creada = await cliente.post(
        "/api/specials",
        json={"id": "s1", "date": "2026-12-24", "name": "Navidad", "mode": "custom"},
        headers=auth,
    )
    assert creada.status_code == 201
    especial = creada.json()["specials"][0]
    assert especial["date"] == "2026-12-24"
    assert [t["time"] for t in especial["bells"]] == ["08:00", "10:00", "12:00"]

    duplicada = await cliente.post(
        "/api/specials", json={"date": "2026-12-24", "name": "Otra", "mode": "off"}, headers=auth
    )
    assert duplicada.status_code == 409

    estado = (
        await cliente.put("/api/schedule/bells/sb1?scope=special:s1", json=TIMBRADO, headers=auth)
    ).json()
    assert len(estado["specials"][0]["bells"]) == 4
    assert len(estado["weekly"]["bells"]) == 3

    estado = (await cliente.patch("/api/specials/s1", json={"mode": "off"}, headers=auth)).json()
    assert estado["specials"][0]["mode"] == "off"

    estado = (await cliente.post("/api/specials/s1/copy-weekly", headers=auth)).json()
    assert len(estado["specials"][0]["bells"]) == 3

    estado = (await cliente.delete("/api/specials/s1", headers=auth)).json()
    assert estado["specials"] == []


async def test_timbrado_no_salta_de_horario(cliente: AsyncClient, auth: dict[str, str]) -> None:
    await cliente.post(
        "/api/specials", json={"id": "s2", "date": "2026-11-02", "mode": "off"}, headers=auth
    )
    await cliente.put("/api/schedule/bells/w1", json=TIMBRADO, headers=auth)
    respuesta = await cliente.put(
        "/api/schedule/bells/w1?scope=special:s2", json=TIMBRADO, headers=auth
    )
    assert respuesta.status_code == 409
    inexistente = await cliente.put(
        "/api/schedule/bells/w2?scope=special:nope", json=TIMBRADO, headers=auth
    )
    assert inexistente.status_code == 404
