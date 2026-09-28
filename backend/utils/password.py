from pwdlib import PasswordHash

pwd_context = PasswordHash.recommended()

# hash password function
def hash_password(password:str) -> str:
    return pwd_context.hash(password)


# verify password
def verify_password(
        plain_password:str,
        hashed_password :str
)-> bool:

    return pwd_context.verify(
        plain_password,
        hashed_password
    )
    