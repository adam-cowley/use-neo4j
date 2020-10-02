import { Driver } from 'neo4j-driver'
import { createContext } from 'react'
import { Neo4jConfig } from './neo4j-config.interface'

export interface Neo4jContextState {
    config: Neo4jConfig;
    database?: string;
    driver?: Driver;
}

export const Neo4jContext = createContext<Neo4jContextState>({} as Neo4jContextState)