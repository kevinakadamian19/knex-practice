require('dotenv').config();

const knex = require('knex')
const knexInstance = knex({
    client: 'pg',
    connection: process.env.DB_URL
});

function searchItem(searchTerm) {
    knexInstance
        .from('shopping_list')
        .select('name')
        .where('name', 'ILIKE', `%${searchTerm}%`)
        .then(result => {
            console.log(result)
        })
}

searchItem('fish');

function pageNumber(page) {
    const itemsPerPage = 6;
    const offSet = itemsPerPage * (page-1)
    knexInstance
        .from('shopping_list')
        .select('name', 'category', 'price', 'checked', 'date_added')
        .limit(itemsPerPage)
        .offset(offSet)
        .then(result => {
            console.log(result)
        })
}

pageNumber(2);

function totalCost() {
    knexInstance
        .select('category')
        .from('shopping_list')
        .groupBy('category')
        .sum('price as total')
        .then(result => {
            console.log(result)
        })
}

totalCost();

function daysAgo(days) {
    knexInstance
    .select('*')
    .from('shopping_list')
    .where(
        'date_added',
        '<',
        knexInstance.raw(`now() - '?? days'::INTERVAL`, days)
    )
    .then(results => {
        console.log(results)
    })
}

daysAgo(1);