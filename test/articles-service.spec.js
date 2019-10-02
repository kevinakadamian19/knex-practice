const ArticlesService = require('../src/articles-service');
const knex = require('knex');

describe(`Articles service object`, function() {
    //Below are the steps to creating test table, and inserting articles before tests are ran.
    //declare variable db aka "database"
    let db;

    //declaring variable for test articles
    let testArticles = [
        {
            id: 1,
            title: 'First test post',
            content: 'First test content',
            date_published: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 2,
            title: 'Second test post',
            content: 'second test content',
            date_published: new Date('2027-01-22T16:28:32.615Z')
        },
        {
            id: 3,
            title: 'Third test post',
            content: 'Third test content',
            date_published: new Date('2028-01-22T16:28:32.615Z')
        }
    ];

    //injecting knex into test file via db variable that references the .env file for client, and connection to  test database
    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
    })

    //clear all table after every test
    before(() => db('blogful_articles').truncate())

    //clear table so one test does not affect another
    afterEach(() => db('blogful_articles').truncate())

    //stopping connection after running test
    after(() => db.destroy())

    

    //Now that the test table is established we are checking with this test suite that testArticles match expected.
    context(`Given 'blogful_articles has data`, () => {
        //insert test articles into test table
        beforeEach(() => {
            return db
                .into('blogful_articles')
                .insert(testArticles)
        })
        it(`getAllArticles() resolves all articles from 'blogful_articles' table`, () => {
            return ArticlesService.getAllArticles(db)
                .then(actual => {
                    expect(actual).to.eql(testArticles.map(article => ({
                        ...article,
                        date_published: new Date(article.date_published)
                    })))
                })
        });
        it(`getById() resolves an article by id from 'blogful_articles' table`, () => {
            //create variables for test involving finding 3rd ID
            const thirdId = 3;
            const thirdTestArticle = testArticles[thirdId-1];
            //test knex method with knexInstance db and test variable
            return ArticlesService.getById(db,thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        title: thirdTestArticle.title,
                        content: thirdTestArticle.content,
                        date_published: thirdTestArticle.date_published,
                    })
                })
        });
        it(`deleteArticle() removes an article by id from 'blogful_articles' table`, () => {
            //listing specific article id to delete. then using getAllArticles filter through options
            const articleId = 3;
            return ArticlesService.deleteArticle(db, articleId)
                .then(() => ArticlesService.getAllArticles(db))
                .then(allArticles => {
                    //copy the test articles array without the "deleted" article
                    const expected = testArticles.filter(article => article.id !== articleId)
                    expect(allArticles).to.eql(expected)
                })
        });
        it(`updateArticle() updatres an article by id from 'blogful_articles table`, () => {
            const idOfArticleToUpdate = 3;
            const newArticleData = {
                title: 'updated title',
                content: 'updated content',
                date_published: new Date()
            }
            return ArticlesService.updateArticle(db, idOfArticleToUpdate, newArticleData)
                .then(() => ArticlesService.getById(db, idOfArticleToUpdate))
                .then(article => {
                    expect(article).to.eql({
                        id: idOfArticleToUpdate,
                        ...newArticleData
                    })
                })

        })
    })
    context(`Given 'blogful_articles has no data`, () => {
        it(`getAllArticles() resolves an empty array`, () => {
            return ArticlesService.getAllArticles(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })
        it(`insertArticle() inserts a new article and resolves new article with an 'id'`, () => {
            //make object that represents article to be inserted
            const newArticle = {
                title: 'Test new title',
                content: 'Test new content',
                date_published: new Date('2020-01-01T00:00:00.000Z')
            }
            //test that the assert method resolves newly created article with incremented id
            return ArticlesService.insertArticle(db, newArticle)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        title: newArticle.title,
                        content: newArticle.content,
                        date_published: new Date(newArticle.date_published)
                    })
                })
        })
    })
})