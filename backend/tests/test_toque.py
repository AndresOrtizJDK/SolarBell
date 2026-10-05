from httpx import AsyncClient

from app.core.configuracion import configuracion


async def test_toque_manual_y_detener(cliente: AsyncClient, auth: dict[str, str]) -> None:
    iniciado = await cliente.post(
        "/api/ring", json={"rings": 2, "ringSeconds": 3, "customDurations": None}, headers=auth
    )
    assert iniciado.status_code == 200
    toque = iniciado.json()["run"]
    assert toque["durations"] == [3, 3]
    assert toque["delivered"] is False
    assert toque["endsAt"] - toque["startedAt"] == 6000 + configuracion.pausa_toque_ms

    actual = (await cliente.get("/api/ring", headers=auth)).json()
    assert actual["run"]["id"] == toque["id"]

    detenido = (await cliente.post("/api/ring/stop", headers=auth)).json()
    assert detenido["run"] is None


async def test_toque_nuevo_reemplaza_al_actual(cliente: AsyncClient, auth: dict[str, str]) -> None:
    primero = (
        await cliente.post("/api/ring", json={"rings": 1, "ringSeconds": 30}, headers=auth)
    ).json()
    segundo = (
        await cliente.post(
            "/api/ring", json={"rings": 2, "ringSeconds": 1, "customDurations": [1, 2]}, headers=auth
        )
    ).json()
    assert segundo["run"]["id"] != primero["run"]["id"]
    assert segundo["run"]["durations"] == [1, 2]
