import { Neo4jScheme } from "./neo4j-config.interface"

import neo4j from 'neo4j-driver'

export const createDriver = (scheme: Neo4jScheme, host: string, port: string | number, username?: string, password?: string) => {
    if ( !username || !password ) {
        return neo4j.driver(`${scheme}://${host}:${port}`)
    }

    return neo4j.driver(`${scheme}://${host}:${port}`, neo4j.auth.basic(username, password))
}