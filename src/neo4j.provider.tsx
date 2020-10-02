import React, { useState } from 'react'
import { Driver } from 'neo4j-driver'
import { LoginForm } from './components/login'

import { Neo4jContext } from './neo4j.context'
import { createDriver } from './driver'
import {  Neo4jConfig, Neo4jScheme } from './neo4j-config.interface'

interface Neo4jProviderProps {
    children: React.ReactNode | React.ReactNode[] | null;
    driver?: Driver;
    scheme?: Neo4jScheme;
    host?: string;
    port?: string | number;
    username?: string;
    password?: string;
}

export const Neo4jProvider: React.FC<Neo4jProviderProps> = (props: Neo4jProviderProps) => {
    const [ config, setConfig ] = useState<Neo4jConfig>({} as Neo4jConfig)
    const [ driver, setDriver ] = useState<Driver | undefined>(props.driver)
    const [ error, setError ] = useState<Error>()
    const [ database, setDatabase ] = useState<string>()

    const attemptLogin = (config: Neo4jConfig) => {
        setConfig(config)
        setDatabase(database)

        const driver = createDriver(config.scheme, config.host, config.port, config.username, config.password)

        driver.verifyConnectivity()
            .then(() => setDriver(driver))
            .catch(e => setError(e))
    }

    if ( !driver ) {
        return (<LoginForm
            error={error}
            onSubmit={attemptLogin}
            {...props}
        />)
    }

    return (
        <Neo4jContext.Provider value={{ driver, config, database }}>
            {props.children}
        </Neo4jContext.Provider>
    )
}
