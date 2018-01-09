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
        message: "Welcome to Supervisor System, Mr. Moses! Choose one below.",
        choices: ["VIEW PRODUCT SALES BY DEPARTMENT","CREATE NEW DEPARTMENT"],
        
    }).then(function(response){
        switch (response.list.toUpperCase()) {
            case "VIEW PRODUCT SALES BY DEPARTMENT":
            let queryForView = 'select departments.department_id as ID' + 
            ', departments.department_name as DepartmentName' + 
            ', departments.over_head_costs as OverHeadCost' +
            ', sum(products.product_sales) as ProductSales ' + 
            'from departments right join products on departments.department_name = products.department_name ' + 
            'group by departments.department_name ' + 
            'order by departments.department_id'
            return getProduct(queryForView)
            
            case "CREATE NEW DEPARTMENT":
            return addDepartment()
            
            default:
            return
        }        
    })
}

function getProduct(query) {
    connection.query(
        query,
        function(error, res){
            if(error){
                throw error
            }
            console.log("\n")
            console.log("|  ID  |  Department Name  |  Over Head Costs  |  Product Sales  |  Total Profit  |")
            console.log("|  --  |  ---------------  |  ---------------  |  -------------  |  ------------  |")
            for(let i = 0; i < res.length; i++){
                console.log("|  " + res[i].ID + "       " +
                "|  " + res[i].DepartmentName + "       " +
                "|  " + res[i].OverHeadCost + "       " +
                "|  " + res[i].ProductSales + "       " +
                "|  " + (parseFloat(res[i].ProductSales) - parseFloat(res[i].OverHeadCost)) + "  |")
            }
            startInquirer()
        }
    )
}


function addDepartment() {
    inquirer.prompt(
        [
            {
                name: "name",
                type: "input",
                message: "Department Name"
            },
            {
                name: "cost",
                type: "input",
                message: "Over Head Costs"
            }
        ]
    ).then(function(response){
        
        let query = 'insert into departments set ?'
        connection.query(
            query,
            {
                department_name: response.name,
                over_head_costs: response.cost,
            },
            function(error, res){
                if(error){
                    throw error
                }

                console.log(response.name + " was added to department database")
                startInquirer()
            }
        )
        
    })
}