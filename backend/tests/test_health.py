import pytest


@pytest.mark.anyio
async def test_health(client):
    res = await client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


@pytest.mark.anyio
async def test_root(client):
    res = await client.get("/")
    assert res.status_code == 200
    assert "message" in res.json()
