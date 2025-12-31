#!/usr/bin/env python3

def grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    else:
        return "Keep practicing!"


def main():
    for score in (95, 82, 70):
        print(f"{score} -> {grade(score)}")


if __name__ == "__main__":
    main()
