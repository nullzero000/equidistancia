"""Matrix projection for ELS visualization (WRR-94 §3).

A match with skip k is projected onto a grid of width |k|. Each row contains
|k| consecutive characters of the motor. The matched letters appear aligned
in a single column, forming the visible "word cross" of WRR.

Input motor is bytes; output rows are str for human-readable display. The
decode happens once up-front — projection is pure indexing afterward.
"""
from src.logic.corpus.encoding import decode


def matrix_projection(
    motor: bytes,
    start: int,
    skip: int,
    context_rows: int = 3,
) -> list[str]:
    """Return rows of width |skip| centered on the ELS match.

    The match letters fall in column (start % |skip|). Each row is exactly
    |skip| characters wide, padded with spaces at the edges of the motor.

    Args:
        motor: consonantal motor as bytes (letter indices per encoding module).
        start: motor index of the first matched letter.
        skip: signed letter spacing of the match.
        context_rows: number of rows above and below the match span to include.

    Returns:
        List of strings, each of length |skip|. The matched letters fall in
        column (start % |skip|) if skip > 0, or (|skip| - 1 - start % |skip|)
        for negative skip (reversed alignment).
    """
    if skip == 0:
        raise ValueError("skip=0 has no matrix projection")

    motor_str = decode(motor)
    width = abs(skip)
    n = len(motor_str)

    col = start % width
    row_start_of_match = start - col

    first_row = row_start_of_match - context_rows * width
    last_row = row_start_of_match + context_rows * width

    rows: list[str] = []
    r = first_row
    while r <= last_row:
        row_chars = []
        for c in range(width):
            motor_idx = r + c
            if 0 <= motor_idx < n:
                row_chars.append(motor_str[motor_idx])
            else:
                row_chars.append(" ")
        rows.append("".join(row_chars))
        r += width

    return rows
