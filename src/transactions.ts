import { useContext } from 'react'
import neo4j, { Transaction } from 'neo4j-driver'
import { Neo4jContext, Neo4jContextState } from './neo4j.context'

export interface TransactionState {
    transaction: Transaction;
    run: Function,
    rollback: Function,
}

export const useTransaction = (defaultAccessMode: any, database?: string): TransactionState => {
    const { driver } = useContext<Neo4jContextState>(Neo4jContext)

    if ( !driver ) throw new Error('`driver` not defined. Have you added it into your app as <Neo4jContext.Provider value={{driver}}> ?')

    const session = driver.session({ database, defaultAccessMode })

    const transaction = session.beginTransaction()

    return {
        transaction,
        run: transaction.run,
        commit: transaction.commit,
        rollback: transaction.commit,
    } as TransactionState

}

export const useReadTransaction = (database?: string): TransactionState => useTransaction(neo4j.session.READ, database)

export const useWriteTransaction = (database?: string): TransactionState => useTransaction(neo4j.session.WRITE, database)
