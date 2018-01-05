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
        name: "list",
        type: "list",
        message: "Welcome to Manager System, Mr. Moses! Choose one below.",
        choices: ["VIEW PRODUCTS FOR SALE","VIEW LOW INV", "ADD TO INV", "ADD NEW PRODUCT"],
        
    }).then(function(response){
        switch (response.list.toUpperCase()) {
            case "VIEW PRODUCTS FOR SALE":
            let queryForView = 'select * from products where stock_quantity > 0'
            return getProduct(queryForView)
            
            case "VIEW LOW INV":
            let queryForLowStock = 'select * from products where stock_quantity < 5'
            return getProduct(queryForLowStock)
            
            case "ADD TO INV":
            return whichProduct()
            
            case "ADD NEW PRODUCT":
            return postProduct()
            
            default:
            return
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
                stock_quantity: response.quantity
            },
            function(error, res){
                if(error){
                    throw error
                }

                console.log(response.name + " was added to database")
                startInquirer()
            }
        )
        
    })
}

function getProduct(query) {
    connection.query(
        query,
        function(error, res){
            if(error){
                throw error
            }
            for(let i = 0; i < res.length; i++){
                console.log("ID: " + res[i].item_id + ", " +
                "Product Name: " + res[i].product_name + ", " +
                "Department Name: " + res[i].department_name + ", " +
                "Price: " + res[i].price + ", " +
                "Stock Quantity: " + res[i].stock_quantity + "\n")
            }
            startInquirer()
        }
    )
}


function whichProduct() {
    inquirer.prompt([
        {
            name: "ID",
            type: "input",
            message: "ID number that you like to change the stock quantity"
        },
        {
            name: "quantity",
            type: "input",
            message: "How many would you like to add more?"
        }
    ]).then(function(result){
        let id = result.ID
        let quantity = result.quantity
        updateStock(id, quantity)
    })
}


function updateStock(id, quantity){
    let query = 'select products.price, products.stock_quantity from products where ?'
    connection.query(query, 
        {
            item_id: id
        },
        function(error, response){
            if(error) {
                throw error
            }
            let updateQuery = 'update products set ? where ?'
            let newStock = parseInt(response[0].stock_quantity) + parseInt(quantity)
            
            connection.query(updateQuery,[
                {
                    stock_quantity: newStock
                },
                {
                    item_id: id
                }
            ], function(err, res){
                if(err) throw err
                
                console.log("\nStock quantity is now updated -> " + quantity + " is added! \n")
                startInquirer()
            })
            
        }
    )
}
