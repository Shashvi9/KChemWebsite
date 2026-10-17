"""CAS registry number checks. Shared by the 0002 migration and the catalog import script."""
import re

_CAS = re.compile(r"^\d{2,7}-\d{2}-\d$")
_DATE_MANGLED = re.compile(r"^(\d{1,2})-(\d{2})-(\d{4,7})$")  # Excel turned "3351-05-1" into "01-05-3351"


def is_valid(cas: str) -> bool:
    if not _CAS.match(cas):
        return False
    d = cas.replace("-", "")
    return sum(int(x) * i for i, x in enumerate(reversed(d[:-1]), 1)) % 10 == int(d[-1])


def normalize(raw: str | None) -> list[str]:
    """All checksum-valid CAS numbers in a raw cell ("61901-98-7/61910-95-9"), else []."""
    out = []
    for part in re.split(r"[/,;]", raw or ""):
        c = re.sub(r"\s+", "", part).rstrip(".")
        if not c:
            continue
        if not is_valid(c):
            m = _DATE_MANGLED.match(c)
            c = f"{m[3]}-{m[2]}-{int(m[1])}" if m else ""
            if not is_valid(c):
                return []  # one bad part: don't guess, leave for manual review
        if c not in out:
            out.append(c)
    return out


if __name__ == "__main__":
    assert is_valid("3351-05-1") and not is_valid("3351-05-2")
    assert normalize("01-05-3351") == ["3351-05-1"]
    assert normalize("4702-90-3, 61969-52-6") == ["4702-90-3", "61969-52-6"]
    assert normalize("1934-94-D") == [] and normalize(None) == [] and normalize("--") == []
    print("ok")
