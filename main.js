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
    respFinal['description'] = parseHtml('div.proddet p').text()
    // map para fazer um array de objetos, parecido com o que eu ja tinha feito sendo o 'e' a posição da tag html
    respFinal['skus'] = parseHtml('div.card').map((i, e) => ({
        // buscando o nome, e atribuindo a chave name
        name: parseHtml(e).find('div.prod-nome').text(),
        // buscando o valor e atribuindo a chave current_price, caso não tenha um valor é adicionado o NULL no resultado final
        
        current_price: parseHtml(e).find('div.prod-pnow').text()
        ? parseFloat(parseHtml(e).find('div.prod-pnow').text().replace(/R\$|/g, "").replace(",", ".").trim()): null,        
        /*
        Para transformar em float primeiro usei o replace para tirar os R$, depois outro replace para substituir a virgula(,) pro pronto(.)
        e a função trim para tirar espaços inuteis. Por ultimo envolvi tudo isso em uma função que passa realmente para float, o parseFloat.
        */
        
        // buscando o valor antigo e atribuindo a chave old_price caso não exista valor antigo o NULL é adicionado no resultado final
        old_price: parseHtml(e).find('div.prod-pold').text()
        ? parseFloat(parseHtml(e).find('div.prod-pold').text().replace(/R\$|/g, "").replace(",", ".").trim()) : null,
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

    respFinal['reviews'] = parseHtml('div.analisebox').map((i, e) => ({
        name: parseHtml(e).find('div.pure-u-21-24 > span.analiseusername').text(),
        date: parseHtml(e).find('div.pure-u-21-24 > span.analisedate').text(),
        score: parseHtml(e).find('div.pure-u-21-24 > span.analisestars').text().replace('☆', '').length,
        text: parseHtml(e).find('p').text()
    })).get()

    // Usei o matodo html para modificar o conteudo do h4, como o 3.3 já é a média apenas coloquei esse valor e usei o
    // parseFloat para colocar ele como sendo um float e não uma string
    respFinal['reviews_average_score'] = parseFloat(parseHtml('div#comments > h4').html('<h4>3.3</h4>').text())

    respFinal['url'] = url

    // Gerar o string JSON
    const jsonRespFinal = JSON.stringify(respFinal)

    // Salver em um arquivo JSON
    fs.writeFile('produto.json', jsonRespFinal, (err) => {
        // Caso dê algum erro, imprime o erro se não cria ou salva a resposta no arquivo (produto.json)
        err ? console.log(err) : console.log('Arquivo salvo com sucesso!')
    })
})

// passei o arquivo JSON em um formatador para melhor visualização, link: https://jsonformatter.curiousconcept.com/#
