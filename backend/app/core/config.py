from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    mp_access_token: str = ""
    mp_webhook_secret: str = ""
    jwt_secret: str
    reco_eventos_ventana_dias: int = 30
    reco_sesion_min_eventos: int = 3
    reco_cron_hora: int = 2
    gemini_api_key: str = ""
    environment: str = "development"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
