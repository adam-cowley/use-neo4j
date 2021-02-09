import React, { useEffect, useState } from 'react'
import { Neo4jConfig } from '../neo4j-config.interface'
import { FormButton, FormInput, FormSelect } from './form-items'

interface LoginDesktopProps {
    classNames: Record<string, any>;
    showActive?: boolean;
    onSubmit: Function;
    hide: Function;
}

interface Neo4jDesktopApi {
   getContext: () => Record<string, any>
}

interface Neo4jDesktopWindow extends Window {
    neo4jDesktopApi: Neo4jDesktopApi;
    [key: string]: any
}

export const LoginDesktop: React.FC<LoginDesktopProps> = ({ classNames, showActive, hide, onSubmit, }) => {
    const [ loading, setLoading ] = useState<boolean>(true)
    const [ projects, setProjects ] = useState([])

    const [ error, setError ] = useState<Error>()
    const [ project, setProject ] = useState({})
    const [ graph, setGraph ] = useState()

    useEffect(() => {
        // @ts-ignore
        if ( !window.neo4jDesktopApi ) {
            setLoading(false)

            return
        }

        // @ts-ignore
        (window as Neo4jDesktopWindow).neo4jDesktopApi.getContext()
            .then(context => {
                const projects = context.projects.map(({ id, name, graphs }) => ({
                    id,
                    name,
                    graphs
                }))

                setProjects(projects)
                setProject(projects[0])
                setGraph(projects[0].graphs[0])
                setLoading(false)
            })
    }, [])

    const handleProjectChange = selected => {
        setProject(selected.value)
        setGraph(selected.value.graphs[0])
    }

    const handleGraphChange = selected => {
        setGraph(selected.value)
    }

    const handleSubmit = () => {
        if ( !graph ) return;

        const { url, host, port, username, password } = (graph! as Record<string, any>).connection.configuration.protocols.bolt

        let scheme = 'neo4j'

        if ( url.includes('://') ) {
            scheme = url.split('://')[0]
        }

        onSubmit({ scheme, host, port, username, password } as Neo4jConfig)
    }

    const connectToActiveGraph = () => {
        const graphs = projects.reduce((state: any[], project: Record<string, any>) => state.concat(project.graphs), [])
        const active = graphs.find((graph: Record<string, any>) => graph.status === 'ACTIVE')

        if ( !active ) setError(new Error('There is no active graph.  Click the `Start` button on a Database in Neoj Desktop and try again.'))

        const { host, port, username, password } = active.connection.configuration.protocols.bolt
        const scheme = 'neo4j'

        onSubmit({ scheme, host, port, username, password } as Neo4jConfig)
    }

    if ( loading ) {
        return <div></div>;
    }

    // @ts-ignore
    const graphs = project?.graphs && <FormSelect classNames={classNames} id="graph" label="Graph" options={project?.graphs.map(value => ({ key: value.id, text: value.name, value }))} value={graph} setter={handleGraphChange} />

    return (
        <div>
            {error && (<div className={classNames.formError}>{error.message}</div>)}

            <FormSelect classNames={classNames} id="project" label="Project" options={projects.map((value: Record<string, any>) => ({ key: value.id, text: value.name, value }))} value={project} setter={handleProjectChange} />

            { graphs }

            <div className={classNames.formButtons}>
                { project && graph && <FormButton text="Connect" className={classNames.formButtonPrimary} onClick={handleSubmit} />}
                { showActive &&  <FormButton text="Active Graph" className={classNames.formButtonSecondary} onClick={connectToActiveGraph} />}
            </div>

            <div className={classNames.loginOtherDatabase}>
                <a onClick={() => hide()}>
                    Or connect to another graph
                </a>
            </div>
        </div>
    )
}