
export function getBalance(statement){

    let saldo = 0

    statement.forEach( movimentacao => {

        if (movimentacao.type === "credit"){
            saldo += movimentacao.amount
        }
        
        else{
            saldo -= movimentacao.amount
        }
    });

    return saldo
}