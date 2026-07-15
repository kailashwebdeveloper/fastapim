from unittest.mock import patch

from main import ensure_users_table


@patch("main.get_connection")
def test_ensure_users_table_creates_schema(mock_get_connection):
    class FakeCursor:
        def execute(self, *args, **kwargs):
            return None

        def fetchall(self):
            return []

        def close(self):
            return None

    class FakeConn:
        def cursor(self):
            return FakeCursor()

        def commit(self):
            return None

        def rollback(self):
            return None

        def close(self):
            return None

    mock_get_connection.return_value = FakeConn()

    ensure_users_table()
