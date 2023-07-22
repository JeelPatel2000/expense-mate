```mermaid
classDiagram
    class User {
        +UserID : int
        +Name : string
        +Email : string
        +Phone : string
        +createGroup()
        +addFriend()
        +createExpense()
        +createSettlement()
    }
    class Group {
        +GroupID : int
        +Name : string
        +Description : string
        +CreationDate : date
        +addExpense()
        +addMember()
        +addSettlement()
    }
    class Expense {
        +ExpenseID : int
        +Description : string
        +Amount : float
        +Date : date
        +Currency : string
        +addExpenseSplit()
        +addExpenseShare()
    }
    class ExpenseSplit {
        +ExpenseSplitID : int
        +ExpenseID : int
        +UserID : int
        +SplitAmount : float
    }
    class ExpenseShare {
        +ExpenseShareID : int
        +ExpenseID : int
        +UserID : int
        +ShareAmount : float
        +ShareStatus : string
    }
    class Settlement {
        +SettlementID : int
        +Description : string
        +Amount : float
        +Date : date
        +Currency : string
    }

    User --> Group : createGroup
    User --> User : addFriend
    User --> Expense : createExpense
    User --> Settlement : createSettlement

    Group --> Expense : addExpense
    Group --> User : addMember
    Group --> Settlement : addSettlement

    Expense --> Group : belongs to
    Expense --> ExpenseSplit : has multiple Payees (within Group)
    Expense --> ExpenseShare : has multiple Payees (across Groups)
    Expense --> User : created by

    ExpenseSplit --> User : Payee (within Group)
    ExpenseSplit --> Expense : Expense

    ExpenseShare --> User : Payee (across Groups)
    ExpenseShare --> Expense : Expense

``````