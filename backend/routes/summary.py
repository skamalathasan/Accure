from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import crud
from database import get_db
from schemas import Summary

router = APIRouter(tags=["summary"])


@router.get("/summary", response_model=Summary)
def read_summary(db: Session = Depends(get_db)):
    return crud.get_summary(db)
