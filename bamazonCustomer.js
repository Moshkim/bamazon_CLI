let inquirer = require('inquirer')
let mysql = require('mysql')


let connection = mysql.createConnection({
    host: 'localhost',
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'bamazon'
})

connection.connect(function(error){
    if(error){
        throw error
    }
    startInquirer()
    
})

function startInquirer() {
    
    inquirer.prompt({
        name: "insertOrget",
        type: "list",
        message: "Would you like to POST a product or GET a product?",
        choices: ["INSERT","SELECT"],
        
    }).then(function(response){
        if(response.insertOrget.toUpperCase() === 'INSERT'){
            postProduct()
        } else {
            getProduct()
        }
        
    })
}

function postProduct() {
    inquirer.prompt(
        [
            {
                name: "name",
                type: "input",
                message: "Product Name"
            },
            {
                name: "department",
                type: "input",
                message: "Department Name"
            },
            {
                name: "price",
                type: "input",
                message: "Price of the product"
            },
            {
                name: "quantity",
                type: "input",
                message: "Stock Quantity"
            }
        ]
    ).then(function(response){

        let query = 'insert into products set ?'
        connection.query(
            query,
            {
                product_name: response.name,
                department_name: response.department,
                price: response.price,
                stock_quantity: response.quantity,
                product_sales: 0,
                product_sold: 0
            },
            function(error, res){
                if(error){
                    throw error
                }
                //console.log(response.affectedRows + ' product inserted!')
                console.log(response.name + " was added to database")
                recursiveInquirer()
            }
        )
        
    })
}

function getProduct() {
    let query = 'select * from products where stock_quantity > 0'
    connection.query(
        query,
        function(error, res){
            if(error){
                throw error
            }
            //console.log(response.affectedRows + ' product inserted!')
            //console.log(res)
            for(let i = 0; i < res.length; i++){
                console.log("ID: " + res[i].item_id + ", " +
                "Product Name: " + res[i].product_name + ", " +
                "Department Name: " + res[i].department_name + ", " +
                "Price: " + res[i].price + ", " +
                "Stock Quantity: " + res[i].stock_quantity + ", " +
                "Product Sale: " + res[i].product_sales + "\n")
            }
            wantToBuy()
        }
    )
    
}

function wantToBuy() {
    inquirer.prompt(
        {
            name: 'buyOrnot',
            type: 'list',
            message: 'Would you like to buy some products?',
            choices: ['YES', 'NO'],
            default: "YES"
        }
    ).then(function(res){
        if(res.buyOrnot === "YES"){
            buyProduct()
        } else {
            startInquirer()
        }
    })
}

function buyProduct() {
    inquirer.prompt([
        {
            name: "ID",
            type: "input",
            message: "ID number that you like to buy from the stock"
        },
        {
            name: "quantity",
            type: "input",
            message: "How many of them would you like to buy?(It should be smaller than current stock quantity!)"
        }
    ]).then(function(result){
        let id = result.ID
        let quantity = result.quantity
        let query = 'select products.price, products.stock_quantity, products.product_sales, products.product_sold from products where ?'
        connection.query(query, 
            {
                item_id: id
            },
            function(error, response){
                if(error) {
                    throw error
                }

                //console.log(response[0].product_sales)
                if(response[0].stock_quantity < result.quantity){
                    console.log("Insufficient quantity!")
                    buyProduct()
                } else {
                    let updateQuery = 'update products set ? where ?'

                    connection.query(updateQuery,[
                        {
                            stock_quantity: (parseInt(response[0].stock_quantity) - parseInt(quantity)),
                            product_sales: ((parseFloat(response[0].product_sales))+(parseFloat(response[0].price) * quantity)),
                            product_sold: (parseInt(response[0].product_sold)+parseInt(quantity))
                        },
                        {
                            item_id: id
                        }
                    ], function(err, res){
                        if(err) throw err

                        console.log("\nStock quantity is now updated!\n")
                        console.log("\nThe total cost of your purchase is: $" + (response[0].price * quantity) + "\n")

                        getProduct()
                    })
                    
                    
                }

            }
        )
    })
}


function recursiveInquirer() {
    inquirer.prompt({
        name: "continue",
        type: "list",
        message: "Would you like to continue to keep inserting or change to get data?",
        choices: ["INSERT","SELECT"],
        
    }).then(function(response){
        if(response.continue.toUpperCase() === 'INSERT'){
            postProduct()
        } else {
            getProduct()
        }
        
    })
    
}