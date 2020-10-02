import React, { FormEvent, useState } from 'react'

import { Neo4jScheme, Neo4jConfig } from '../neo4j-config.interface'
const { schemes } = require('../neo4j.constants')


const globalClassNames = {
    semantic: {
        login: 'vue-neo4j connect ui middle aligned center aligned grid',
        loginContainer: 'column',
        loginServerGroup: 'fields',


        form: 'ui form',
        formError: 'ui negative message',
        formGroup: 'form-group field',
        formInput: 'form-control',

        formButtonPrimary: 'fluid ui button primary submit btn btn-success',
        formButtonSecondary: 'ui button submit btn btn-success btn-connect-active',




    }
}



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

    const classNames = globalClassNames.semantic

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        onSubmit({ scheme, host, port, username, password })
    }

    return (
        <div className={classNames.login}>
            <div className={classNames.loginContainer}>
                {error && (<div className={classNames.formError}>{error.message}</div>)}
                <form className={classNames.form} onSubmit={handleSubmit}>
                    <div className={classNames.loginServerGroup}>
                    <div className={classNames.formGroup}>
                        <label htmlFor="scheme">Scheme</label>
                        <select className={classNames.formInput} id="scheme" onChange={e => setScheme(e.currentTarget.value as Neo4jScheme)}>
                            {schemes.map((scheme: Neo4jScheme) => (<option key={scheme} value={scheme}>
                                {scheme}
                            </option>
                            ))}
                        </select>
                    </div>
                    <div className={classNames.formGroup}>
                        <label htmlFor="host">Host</label>
                        <input className={classNames.formInput} id="host" type="text" value={host} onChange={e => setHost(e.target.value)} />
                    </div>
                    <div className={classNames.formGroup}>
                        <label htmlFor="port">Port</label>
                        <input className={classNames.formInput} id="port" type="number" value={port} onChange={e => setPort(e.target.value)} />
                    </div>
                    </div>

                    <div className={classNames.formGroup}>
                        <label htmlFor="username">Username</label>
                        <input className={classNames.formInput} id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>

                    <div className={classNames.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input className={classNames.formInput} id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>

                    <div className={classNames.formGroup}>
                        <label htmlFor="database">Database</label>
                        <input className={classNames.formInput} placeholder="(default)" id="database" type="text" value={database} onChange={e => setDatabase(e.target.value)} />
                    </div>

                    <div>
                        <button type="submit" className={classNames.formButtonPrimary}>
                            Connect to Neo4j
                        </button>
                    </div>
                </form>
            </div>
        </div>

    )
}