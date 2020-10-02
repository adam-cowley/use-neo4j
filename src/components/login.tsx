import React, { FormEvent, useState } from 'react'

import { Neo4jScheme, Neo4jConfig } from '../neo4j-config.interface'
const { schemes } = require('../neo4j.constants')

interface LoginProps {
    error?: Error;
    onSubmit: (config: Neo4jConfig) => void;
    scheme?: Neo4jScheme;
    host?: string;
    port?: string | number;
    username?: string;
    password?: string;
    database?: string;
}

export const LoginForm: React.FC<LoginProps> = ({ error, onSubmit, ...props }) => {
    const [scheme, setScheme] = useState<Neo4jScheme>('neo4j')
    const [host, setHost] = useState(props.host || 'localhost')
    const [port, setPort] = useState(props.port || 7687)
    const [username, setUsername] = useState(props.username || 'neo4j')
    const [password, setPassword] = useState(props.password || 'neo')
    const [database, setDatabase] = useState(props.database)

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        onSubmit({ scheme, host, port, username, password })
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && (<div className="error">{error.message}</div>)}
            <div>
                <label htmlFor="scheme">Scheme</label>
                <select id="scheme" onChange={e => setScheme(e.currentTarget.value as Neo4jScheme)}>
                    {schemes.map((scheme: Neo4jScheme) => (<option key={scheme} value={scheme}>
                        {scheme}
                    </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="host">Host</label>
                <input id="host" type="text" value={host} onChange={e => setHost(e.target.value)} />
            </div>
            <div>
                <label htmlFor="port">Port</label>
                <input id="port" type="number" value={port} onChange={e => setPort(e.target.value)} />
            </div>

            <div>
                <label htmlFor="username">Username</label>
                <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} />
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <div>
                <label htmlFor="database">Database</label>
                <input placeholder="(default)" id="database" type="text" value={database} onChange={e => setDatabase(e.target.value)} />
            </div>

            <div>
                <input type="submit" value="Connect to Neo4j"/>
            </div>
        </form>
    )
}