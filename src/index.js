const express = require('express')
const { v4: uuidv4 } = require('uuid')

const app = express()
app.use(express.json())

const costummers = []


//Middleware

function verificarSeContaExisteCPF(request, response, next) {

    const { cpf } = request.headers;

    const costummer = costummers.find(costummer => costummer.cpf === cpf)

    if (!costummer) {
        return response.status(400).json({ error: "Cliente inexistente" })
    }

    request.costummer = costummer;

    return next()
}


//Funcoes financeiras

function getBalance(statement){

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







app.post('/account', (request, response) => {

    const { cpf, name } = request.body;

    //verificando se recebeu o cpf ou nome
    if (!cpf || !name) {
        return response.status(400).json({ error: "Dados ausentes!" })
    }

    //verificando se ja existe algum usuario com esse cpf
    costummerAlreadyExists = costummers.some((costummer) => costummer.cpf === cpf)

    if (costummerAlreadyExists) {
        return response.status(400).json({ error: "Cpf já cadastrado" })
    }

    costummers.push({
        name,
        cpf,
        id: uuidv4(),
        statement: []
    })

    console.log(costummers)

    return response.status(201).json({
        message: "Conta cadastrada com sucesso"
    })



})


//buscar extrato bancário
app.get("/statement", verificarSeContaExisteCPF, (request, response) => {

    const { costummer } = request;

    return response.status(200).json(costummer.statement)

})

app.post("/deposit", verificarSeContaExisteCPF, (request, response) => {

    const { description, amount } = request.body;

    const { costummer } = request;

    const statementOperation = {
        amount,
        description,
        created_at: new Date(),
        type: "credit"
    }

    costummer.statement.push(statementOperation)

    return response.status(201).json({
        message: "Depósito efetuado com sucesso"
    })


})

app.post("/withdraw", verificarSeContaExisteCPF, (request, response)=>{

    const { costummer } = request;

    const { amount } = request.body;

    const saldo = getBalance(costummer.statement)

    if (saldo < amount){
        return response.status(400).json({
            error: "Saldo insuficiente"
        })
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    }

    costummer.statement.push(statementOperation)

    return response.status(200).json({
        message: `Saque de R$${amount} efetuado com sucesso`
    })

})



//buscar extrato bancário
app.get("/statement/date", verificarSeContaExisteCPF, (request, response) => {

    const { costummer } = request;

    const {date} = request.query;

    const dateFormat = new Date(date + " 00:00")

    const statement = costummer.statement.filter( (statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString() )

    return response.json(statement) 

})

app.put("/account", verificarSeContaExisteCPF, (request, response) => {

    const {costummer} = request;

    const { name } = request.body;

    if (!name){
        return response.status(400).json({
            error: "Nome ausente"
        })
    }

    costummer.name = name;

    return response.status(201).json({
        message: "Nome alterado com sucesso"
    })

})

app.get("/account", verificarSeContaExisteCPF, (request, response) => {

    const {costummer} = request;


    return response.status(200).json(costummer)

})


app.listen(4000)