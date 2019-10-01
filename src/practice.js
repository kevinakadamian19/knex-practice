require('dotenv').config();
const knex = require('knex')

const knexInstance = knex({
    client: 'pg',
    connection: process.env.DB_URL
})

/*function searchProduceByName(searchTerm) {
    knexInstance
    .from('amazong_products')
    .select('product_id', 'price', 'name', 'category')
    .where('name', 'ILIKE',`%${searchTerm}%`)
    .then(result => {
        console.log(result)
    })
}

searchProduceByName('holo'); */

/* function paginateProduce(page) {
    const productsPerPage = 10;
    const offset = productsPerPage * (page-1);
    knexInstance
        .from('amazong_products')
        .select('product_id', 'name', 'price', 'category')
        .limit(productsPerPage)
        .offset(offset)
        .then(result => {
            console.log(result)
    })
};

paginateProduce(2) */

/* function filterProduceWithoutImages() {
    knexInstance
        .from('amazong_products')
        .select('product_id', 'name', 'category', 'price')
        .whereNotNull('image')
        .then(result => {
            console.log(result)
        })
}

filterProduceWithoutImages(); */

function mostPopularVideos(days) {
    knexInstance
        .select('video_name', 'region')
        .count('date_viewed AS views')
        .from('whopipe_video_views')
        .where(
            'date_viewed', 
            '>', 
            knexInstance.raw(`now() - '?? days'::INTERVAL`, days)
        )
        .groupBy('video_name', 'region')
        .orderBy([
            {column: 'region', order: 'ASC'},
            {column: 'views', order: 'DESC'}
        ])
        .then(result => {
            console.log(result)
    })
}

mostPopularVideos(30);