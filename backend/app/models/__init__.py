# Import all models here so SQLAlchemy's registry is complete before create_all()
from app.models.user import User  # noqa: F401
from app.models.hosted_zone import HostedZone  # noqa: F401
from app.models.dns_record import DNSRecord  # noqa: F401
