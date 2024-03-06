// Bibliotecas necessarias
const cheerio = require('cheerio')
const request = require('request')

// Biblioteca file system (proprio node.js)
const fs = require('fs')

// Guardando a url do site em uma variavel
const url = 'https://infosimples.com/vagas/desafio/commercia/product.html'

// Obj que armazenará todos os dados
const respFinal = {}

request(url, (error, response, body) => { 
    // Carregando o body
    const parseHtml = cheerio.load(body)

    // Pegando o que foi solicitado
    respFinal['title'] = parseHtml('h2#product_title').text()
    respFinal['brand'] = parseHtml('div.brand').text()
    // iteração sobre cada elemento da tag 'a', depois o metodo get() para retornar um array de string 
    respFinal['categories'] = parseHtml('nav a').map((i, e) => parseHtml(e).text()).get()
    // respFinal['description'] = parseHtml('div.proddet p').text()
    // const teste = []
    // parseHtml('div.skus-area').each((i, e) => {
    //     const name = parseHtml(e).find('div.prod-nome').text()
    //     const currentPrice = parseHtml(e).find('div.prod-pnow').text()
    //     const oldPrice = parseHtml(e).find('div.prod-pold').text()
    //     const avalible = parseHtml(e).find('div.card').text()
    //     const data = {name, currentPrice, oldPrice, avalible}
    //     teste.push(data)
    //     console.log(teste)
    // })

    // Gerar o string JSON
    const jsonRespFinal = JSON.stringify(respFinal)

    // Salver em um arquivo JSON
    fs.writeFile('produto.json', jsonRespFinal, (err) => {
        // Caso dê algum erro, imprime o erro se não cria ou salva a resposta no arquivo (produto.json)
        err ? console.log(err) : console.log('Arquivo salvo com sucesso!')
    })
})