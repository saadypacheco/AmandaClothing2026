"""
Configuración de pytest. Usa dependency_overrides de FastAPI para mockear Supabase
correctamente — evita el problema de módulos que importaron get_supabase_client
a nivel de módulo antes de que el patch estuviera activo.
"""
import os
import pytest
from unittest.mock import MagicMock
from httpx import AsyncClient, ASGITransport

os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-key")
os.environ.setdefault("JWT_SECRET", "test-jwt-secret")
os.environ.setdefault("MP_ACCESS_TOKEN", "")
os.environ.setdefault("MP_WEBHOOK_SECRET", "")


@pytest.fixture
def supabase_mock():
    """Mock del cliente Supabase. Cada test recibe una instancia fresca."""
    mock = MagicMock()
    # Default: data vacía para evitar AttributeError en accesos a .data
    mock.table.return_value.select.return_value.order.return_value.execute.return_value.data = []
    mock.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
    mock.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = []
    mock.table.return_value.select.return_value.in_.return_value.execute.return_value.data = []
    mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = None
    return mock


@pytest.fixture
async def client(supabase_mock):
    """
    Cliente HTTP con Supabase mockeado via dependency_overrides de FastAPI.
    Esto garantiza que los routers usen el mock sin importar cómo importaron
    get_supabase_client.
    """
    from app.main import app
    from app.routers.admin import get_db as admin_get_db
    from app.routers.productos import get_db as productos_get_db
    from app.routers.eventos import get_db as eventos_get_db
    from app.routers.recomendaciones import get_db as recomendaciones_get_db
    from app.routers.config import get_db as config_get_db
    from app.routers.pedidos import get_db as pedidos_get_db
    from app.routers.chat import get_db as chat_get_db
    from unittest.mock import patch

    def override_db():
        return supabase_mock

    app.dependency_overrides[admin_get_db] = override_db
    app.dependency_overrides[productos_get_db] = override_db
    app.dependency_overrides[eventos_get_db] = override_db
    app.dependency_overrides[recomendaciones_get_db] = override_db
    app.dependency_overrides[config_get_db] = override_db
    app.dependency_overrides[pedidos_get_db] = override_db
    app.dependency_overrides[chat_get_db] = override_db

    # main.py llama get_supabase_client() directamente en /categorias (import inline)
    with patch("app.db.client.get_supabase_client", return_value=supabase_mock):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            yield c

    app.dependency_overrides.clear()
