<div style="text-align:center">
<h1>React Hooks For Neo4j</h1>

<img src="https://raw.githubusercontent.com/adam-cowley/use-neo4j/main/img/react.png" height="100">
<img src="https://raw.githubusercontent.com/adam-cowley/use-neo4j/main/img/arrow.svg" height="100">
<img src="https://raw.githubusercontent.com/adam-cowley/use-neo4j/main/img/neo4j.png" height="100">
</div>

A set of components and hooks for building React applications that communicate to Neo4j.  This is a package intended to speed up the development by reducing the amount of boilerplate code required. It is not intended for public-facing/production applications used by external users.

A basic example of this library has been configured in the [Graph App Starter Kit for React](https://github.com/adam-cowley/graphapp-starter-react) template repository.


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

#### Hide Database

You can hide the database field from the form by passing `showDatabase` prop with a value of `false`

```tsx
<Neo4jProvider showDatabase={false}>
```

#### Hide Host

You can force the user to connect to a specific database by providing the connection details to the `Neo4jProvider` and set the `showHost` prop to false.

```tsx
<Neo4jProvider scheme="neo4j" host="localhost" port="7687" showHost={false}>
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
    records?: Neo4jRecord[];
    first?: Neo4jRecord;
    run: (params?: Record<string, any>, anotherDatabase?: string) => Promise<void | QueryResult>;
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
useWriteCypher(cypher: string, params?: Record<string, any>, database?: string): Neo4jResultState
```

#### Re-running a Query

The `run` function allows you to re-run a query if a prop changes.  This should be wrapped in a `useEffect` function.

```tsx
const [ query ] = useState('Matrix')
const { loading, records, run, } = useReadCypher('MATCH (m:Movie) WHERE m.title CONTAINS $query RETURN m LIMIT 12', { query })

// Listen for changes to `query` and re-run cypher if anything changes
useEffect(() => {
    run({ query })
}, [ query ])
```

### Lazy Queries

If you don't want the query to run straight away (for example an update query), you can use the `useLazyReadCypher` or `useLazyWriteCypher` functions.  The hooks return an array containing the function to run the query and the `Neo4jResultState` as the second parameter:

```tsx
const [ updateMovie, { loading, first } ] = useLazyWriteCypher(
  `MATCH (m:Movie) WHERE id(m) = $id SET m += $updates, m.updatedAt = datetime() RETURN m.updatedAt as updatedAt`
)

const handleSubmit = e => {
    e.preventDefault()

    updateMovie({ id: int(0), updates: { title, plot } })
        .then(res => {
            res && setConfirmation(`Node updated at ${res.records[0].get('updatedAt').toString()}`)
        })
        .catch(e => setError(e))
}

return (
  <Button primary onClick={handleSubmit}>Update Node</Button>
)
```

The run function takes two optional arguments: an object of params and a database if different from the default.


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


## Schema Hooks

### useSchema

**Note:** Requires [APOC](https://neo4j.com/labs/apoc/)

The `useSchema` hook calls the [`apoc.meta.schema` procedure](https://neo4j.com/labs/apoc/4.1/database-introspection/meta/) and returns arrays of labels and relationship types.

Usage:
```ts
const { loading, labels, types } = useSchema(database)
```

Output:

```ts
export interface UseSchemaOutput {
    loading: boolean;
    labels: LabelSchema[];
    types: RelationshipTypeSchema[];
}
```

### useDatabases

The `useDatabases` hook returns a list of databases for the current connection (version 4.0 and above).  The hook runs the `SHOW DATABASES` query against the system database and returns a list of databases.


```ts
const { loading, error, databases } = useDatabases()
```

Output:

```ts
interface UseDatabasesOutput {
    loading: boolean;
    error?: Error;
    databases: Database[] | undefined
}
```

A `Database` object consists of:

```ts
interface Database {
    name: string;
    address: string;
    role: DatabaseRole;
    requestedStatus: DatabaseStatus;
    currentStatus: DatabaseStatus;
    error: string;
    default: boolean;
}
```

## Connection Hooks

### useConnection

The `useConnection` hook allows you to update the connection details for the driver held in `Neo4jContext`

```ts
useConnection(scheme: Neo4jScheme, host: string, port: string | number, username: string, password: string)
```

This hook will update the driver instance within the context and attempt to verify connectivity.
