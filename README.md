<div style="text-align:center">
<h1>React Hooks For Neo4j</h1>

<img src="img/neo4j.png" height="100">
<img src="img/arrow.svg" height="100">
<img src="img/react.png" height="100">


</div>


## Installation

```
npm i --save use-neo4j
```


## Usage

### Creating a Driver instance

If you want to hard code the Driver credentials into your app, you can use the `createDriver` helper function to create a new Driver instance and pass it to the `Neo4jProvider`.  This will cause the child components to be rendered immediately.

```tsx
import { Neo4jProvider, createDriver } from 'use-neo4j'

const driver = createDriver('neo4j', 'localhost', 7687, 'neo4j', 'letmein')

ReactDOM.render(
  <React.StrictMode>
    <Neo4jProvider driver={driver}>
      <App />
    </Neo4jProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

### Login Form

If you do not pass a driver instance to the `Neo4jProvider`, a login form will be displayed.  You can pass default values through to the form using props:

```tsx
import { Neo4jProvider } from 'use-neo4j'

ReactDOM.render(
  <React.StrictMode>
    <Neo4jProvider scheme="neo4j+s" host="myauradb.neo4j.io" port="7687" username="username" password="defaultpassword" database="mydb">
      <App />
    </Neo4jProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

## Hooks

### Cypher

The cypher hooks will run a query against the Neo4j database using the driver instance passed to the `Neo4jProvider` or created during the login process.  Each hook returns a `Neo4jResultState` which gives you access to a loading boolean, the result itself, any errors thrown during the query and helpers for accessing the first row.

```ts
export interface Neo4jResultState {
    cypher: string;
    params?: Record<string, any>;
    database?: string;
    loading: boolean;
    error?: Error;
    result?: QueryResult;
    records?: Neo4jRecord[],
    first?: Neo4jRecord,
}
```


#### useReadCypher

```ts
useReadCypher(cypher: string, params?: Record<string, any>, database?: string): Neo4jResultState
```

Example code:

```tsx
function MyComponent() {
    const query = `MATCH (m:Movie {title: $title}) RETURN m`
    const params = { title: 'The Matrix' }

    const { loading, first } = useReadCypher(query, params)

    if ( loading ) return (<div>Loading...</div>)

    // Get `m` from the first row
    const movie = first.get('m')

    return (
        <div>{movie.properties.title} was released in {movie.properties.year}</div>
    )
}
```

#### useWriteCypher

```ts
useReadCypher(cypher: string, params?: Record<string, any>, database?: string): Neo4jResultState
```


### Transactions

Transaction hooks give you a convenient way to open a new transaction.

```ts
export interface TransactionState {
    transaction: Transaction;
    run: Function,
    rollback: Function,
}
```

#### useReadTransaction

```ts
useReadTransaction(database?: string): TransactionState
```

#### useWriteTransaction
```ts
useWriteTransaction(database?: string): TransactionState
```

Example:

```ts
import { useReadTransaction } from 'use-neo4j'

const { transaction, commit, rollback } = useTransaction('mydb')

fetchSomeData()
    .then(properties => {
        // Use `run` to execute a query within the transaction
        return run(`CREATE (n:Node) SET n+= $properties`, { properties })
            //  If all is fine, commit the transaction
            .then(() => commit())
    })
    // If anything goes wrong, you can rollback the transaction
    .catch(e => rollback())
```

