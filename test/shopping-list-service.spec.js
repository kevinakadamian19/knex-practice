const ShoppingListService = require('../src/shopping-list-service');
const knex = require('knex');

describe(`Shopping List Service Object`, function() {
    //below are the steps to testing CRUD methods for shopping-list service
    let db;
    //declaring testList object
    let testList = [
        {
            id: 1,
            name: 'item a',
            category: 'Snack',
            price: '4.00',
            date_added: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 2,
            name: 'item b',
            category: 'Main',
            price: '5.00',
            date_added: new Date('2028-01-22T16:28:32.615Z')
        },
        {
            id: 3,
            name: 'item c',
            category: 'Lunch',
            price: '6.00',
            date_added: new Date('2027-01-22T16:28:32.615Z')
        },
        {
            id: 4,
            name: 'item d',
            category: 'Breakfast',
            price: '6.00',
            date_added: new Date('2026-01-22T16:28:32.615Z')
        },
    ];
    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
    })
    //clear all table after every test
    before(() => db('shopping_list').truncate())

    //clear table so one test does not affect another
    afterEach(() => db('shopping_list').truncate())

    //stopping connection after running test
    after(() => db.destroy())
    
    context(`Given shopping_list has data`, () => {
        beforeEach(() => {
            return db
                .into('shopping_list')
                .insert(testList)
        })
        it(`getEntireList() returns entire shopping_list table`, () => {
            const expectedItems = testList.map(item => ({
                ...item,
                checked: false
            }))
            return ShoppingListService.getEntireList(db)
                .then(actual => {
                    expect(actual).to.eql(expectedItems)
                })
        })
        it(`getbyId() resolves an article by id from 'shopping_list' table`, () => {
            const idToGet= 3;
            const thirdItem = testList[idToGet-1]
            return ShoppingListService.getById(db, idToGet)
            .then(actual => {
                expect(actual).to.eql({
                    id: idToGet,
                    name: thirdItem.name,
                    date_added: thirdItem.date_added,
                    price: thirdItem.price,
                    category: thirdItem.category,
                    checked: false
                })
            })
        })
        it(`deleteItem() removes an article by id from 'shopping_list`, () => {
            const articleId = 3
            return ShoppingListService.deleteItem(db, articleId)
                .then(() => ShoppingListService.getEntireList(db))
                .then(allItems => {
                    const expected = testList.filter(article => article.id !== articleId)
                    .map(item => ({
                        ...item,
                        checked: false
                    }))
                    expect(allItems).to.eql(expected)
                })
        })
        it(`updateItem() updates an article by id from 'shopping_list`, () => {
            const itemToUpdate = 3
            const newItemData = {
                name: 'item e',
                date_added: new Date(),
                price: '4.99',
                category: 'Breakfast',
                checked: true
            };
            const originalItem = testList[itemToUpdate-1];
            return ShoppingListService.updateItem(db, itemToUpdate, newItemData)
                .then(() => ShoppingListService.getById(db, itemToUpdate))
                .then(article => {
                    expect(article).to.eql({
                        id: itemToUpdate,
                        ... originalItem,
                        ...newItemData
                    })
                })
        })
    });

    context(`Given shopping_list has no data`, () => {
        it(`getAllItems() returns an empty array`, () => {
            return ShoppingListService.getEntireList(db)
            .then(actual => {
                expect(actual).to.eql([])
            })
        })
        it(`insertItem() adds item to 'shopping_list'`, () => {
            const newItem = {
                name: 'new item name',
                price: '6.04',
                date_added: new Date('2020-01-01T00:00:00.000Z'),
                checked: true,
                category: 'Lunch'
            }
            return ShoppingListService.insertItem(db, newItem)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        name: newItem.name,
                        price: newItem.price,
                        category: newItem.category,
                        checked: newItem.checked,
                        date_added: newItem.date_added,
                    })
                })
        })

    })
})