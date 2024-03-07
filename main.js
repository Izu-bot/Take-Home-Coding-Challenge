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

    // map para fazer um array de objetos, parecido com o que eu ja tinha feito sendo o 'e' a posição da tag html
    respFinal['skus'] = parseHtml('div.card').map((i, e) => ({
        // buscando o nome, e atribuindo a chave name
        name: parseHtml(e).find('div.prod-nome').text(),
        // buscando o valor e atribuindo a chave current_price, caso não tenha um valor é adicionado o NULL no resultado final
        current_price: parseHtml(e).find('div.prod-pnow').text() ? parseHtml(e).find('div.prod-pnow').text() : null,
        // buscando o valor antigo e atribuindo a chave old_price caso não exista valor antigo o NULL é adicionado no resultado final
        old_price: parseHtml(e).find('div.prod-pold').text() ? parseHtml(e).find('div.prod-pold').text() : null,
        /*
        Verificando se a classe not-avaliable existe, caso exista adiciona um TRUE, optei por usar essa classe pois
        as outras duas tinham nomes diferentes. E finalmente o valor é adicionado na chave avaliable
        */
        available: parseHtml(e).hasClass('not-avaliable')
    })).get();
    // por fim, o get irá converter o objeto criado pelo map em um array

    // encurtando ao maximo o caminho para os valores importantes
    respFinal['properties'] = parseHtml('table.pure-table > tbody > tr').map((i, e) => ({
        label: parseHtml(e).find('td > b').text(),
        // uso do metodo next para ele pegar o proximo td, sem o next ele armazenaria os dois td's que contem nos 'tr'
        value: parseHtml(e).find('td').next().text()
    })).get()

    // Gerar o string JSON
    const jsonRespFinal = JSON.stringify(respFinal)

    // Salver em um arquivo JSON
    fs.writeFile('produto.json', jsonRespFinal, (err) => {
        // Caso dê algum erro, imprime o erro se não cria ou salva a resposta no arquivo (produto.json)
        err ? console.log(err) : console.log('Arquivo salvo com sucesso!')
    })
})