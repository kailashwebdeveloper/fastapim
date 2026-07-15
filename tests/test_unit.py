from main import hash_password, verify_password


def test_hash_password_returns_string():
    value = hash_password("secret")
    assert isinstance(value, str)
    assert len(value) > 0


def test_verify_password_matches_hashed_value():
    password = "secret"
    hashed = hash_password(password)
    assert verify_password(hashed, password) is True


def test_verify_password_fails_for_wrong_password():
    hashed = hash_password("secret")
    assert verify_password(hashed, "wrong") is False
