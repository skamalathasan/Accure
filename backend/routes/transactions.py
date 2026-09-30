from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

import crud
from database import get_db
from schemas import TransactionInput, TransactionOut

router = APIRouter(prefix="/transactions", tags=["transactions"])


def get_or_404(db: Session, transaction_id: int):
    transaction = crud.get_transaction(db, transaction_id)
    if transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.get("", response_model=list[TransactionOut])
def list_transactions(db: Session = Depends(get_db)):
    return crud.list_transactions(db)


@router.get("/{transaction_id}", response_model=TransactionOut)
def read_transaction(transaction_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, transaction_id)


@router.post("", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(data: TransactionInput, db: Session = Depends(get_db)):
    return crud.create_transaction(db, data)


@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(transaction_id: int, data: TransactionInput, db: Session = Depends(get_db)):
    transaction = get_or_404(db, transaction_id)
    return crud.update_transaction(db, transaction, data)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    transaction = get_or_404(db, transaction_id)
    crud.delete_transaction(db, transaction)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
