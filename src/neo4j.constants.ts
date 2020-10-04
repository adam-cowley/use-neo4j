import { Neo4jScheme } from "./neo4j-config.interface";

export const schemes: Neo4jScheme[] = ['neo4j', 'neo4j+s', 'neo4j+scc', 'bolt', 'bolt+s', 'bolt+scc']

export const globalClassNames = {
    semantic: {
        login: 'login ui middle aligned center aligned grid',
        loginContainer: 'column',
        loginServerGroup: 'fields',
        loginOtherDatabase: 'form-group ui aligned',

        form: 'ui form',
        formError: 'ui negative message',
        formGroup: 'form-group field',
        formInput: 'form-control',

        formButtons: 'form-buttons',
        formButtonPrimary: 'ui button primary',
        formButtonSecondary: 'ui button basic primary',
    },
}