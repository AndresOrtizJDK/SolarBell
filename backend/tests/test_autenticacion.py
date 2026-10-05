from httpx import AsyncClient

from app.core.configuracion import configuracion


async def test_login_rechaza_contrasena_incorrecta(cliente: AsyncClient) -> None:
    respuesta = await cliente.post(
        "/api/auth/login", json={"email": configuracion.correo_admin, "password": "nope"}
    )
    assert respuesta.status_code == 401


async def test_login_ignora_mayusculas_del_correo(cliente: AsyncClient) -> None:
    respuesta = await cliente.post(
        "/api/auth/login",
        json={
            "email": configuracion.correo_admin.upper(),
            "password": configuracion.contrasena_admin,
        },
    )
    assert respuesta.status_code == 200
    assert respuesta.json()["user"]["email"] == configuracion.correo_admin


async def test_rutas_protegidas_piden_token(cliente: AsyncClient) -> None:
    assert (await cliente.get("/api/schedule")).status_code == 401
    respuesta = await cliente.get("/api/auth/me", headers={"Authorization": "Bearer x"})
    assert respuesta.status_code == 401


async def test_actualizar_nombre(cliente: AsyncClient, auth: dict[str, str]) -> None:
    respuesta = await cliente.patch("/api/auth/me", json={"name": "  Andrés "}, headers=auth)
    assert respuesta.status_code == 200
    assert respuesta.json()["name"] == "Andrés"
    yo = await cliente.get("/api/auth/me", headers=auth)
    assert yo.json()["name"] == "Andrés"


async def test_salud(cliente: AsyncClient) -> None:
    respuesta = await cliente.get("/api/health")
    assert respuesta.json() == {"status": "ok", "db": True, "deviceOnline": False}
