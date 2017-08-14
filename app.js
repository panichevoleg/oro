/*
 * Application shows text content as collapsible elements in 2-level navigation (left menu and tabs).
 * 
 * API for fetching content:
 * - left-items.json - left menu
 * - top-items-<left-menu-alias>.json - tabs for active left menu item
 * - elements-<tab-alias>.json - content elements for active tab
 * 
 * In this application json mock files used instead of external API.
 * 
 */

const {
  HashRouter,
  Switch,
  Route,
  Link
} = ReactRouterDOM

/*
 * Collapsible content element. Application can be expanded by adding new types of elements (f.e. TextElement, FormElement etc.)
 */
class CollapsibleElement extends React.Component{
    render(){
        /* build url for each content element: current url plus (if collapsed) OR minus (if expanded) target element */
        let ids = this.props.active.length > 0 ? (this.props.active).toString().split('+') : [],
            id = this.props.item.id.toString(),
            idx = ids.indexOf(id)
        if (idx > -1){
            ids.splice(idx, 1)
        }
        else{
            ids.push(id)
        }
        let href = `/${this.props.leftActive}/${this.props.topActive}/`+ids.join('+')
        return (
            <div>
                <Link to={href} className={"list-group-item " + (this.props.isActive ? 'active' : '')}>
                    <span className="glyphicon glyphicon-triangle-bottom"></span>
                    <span className="glyphicon glyphicon-triangle-top"></span>
                    {this.props.item.title}
                </Link>
                <div className={"collapse" + (this.props.isActive ? ' in' : '')}>
                    <div>
                        {this.props.item.body}
                    </div>
                </div>
            </div>
        )
    }
}

/*
 * Main content area - container for content elements
 */
class ContentArea extends React.Component{
    render(){
        return (
            <div className="content-area" id="content-area">
                {this.props.items.map((v) => {
                    /* render required element repending of `type` of element */
                    switch (v.type){
                        case 'collapsible':
                            return <CollapsibleElement key={v.id} item={v} isActive={this.props.active.indexOf(v.id) > -1}
                                        leftActive={this.props.leftActive}
                                        topActive={this.props.topActive}
                                        active={this.props.active} />
                        /* new types can be added here */
                        default:
                            return ''
                    }
                }
                )}
            </div>
        )
    }
}

/*
 * Tabs
 */
class TopNavigation extends React.Component{
    render(){
        return (
            <ul className="nav nav-tabs">
                {this.props.items.map((v) =>
                    <li role="presentation" className={this.props.active == v.alias ? "active " : ""} key={v.id}>
                        <Link to={`/${this.props.leftActive}/${v.alias}`}>{v.name}</Link>        
                    </li>
                )}
            </ul>
        )
    }
}

/*
 * Left menu
 */
class SidebarNavigation extends React.Component{
    render(){
        return (
            <div className="col-xs-6 col-sm-3 sidebar-offcanvas" id="sidebar">
                <div className="list-group">
                    {this.props.items.map((v) =>
                        <Link to={`/${v.alias}`} key={v.id} className={"list-group-item " + (this.props.active == v.alias ? "active" : "")}>{v.name}</Link>
                    )}
                </div>
            </div>
        )
    }
}

/*
 * Root application component
 */
class App extends React.Component{
    
    constructor(props){
        super(props)
        /* initial state of application */
        this.state = {
            'leftItems': [], // left menu items
            'topItems': [], // tabs
            'contentItems': [],  // content elements
            'leftItemActive': null, // selected item of left menu
            'topItemActive': null, // selected tab
            'contentItemsActive': [] // expanded content elements
        }
    }
    
    // when application gets initialized ...
    componentDidMount(){
        this.updateApp(this.props)
    }
    
    // ... or updated ...
    componentWillReceiveProps(nextProps){
        this.updateApp(nextProps)
    }
    
    // ... process new state of application
    updateApp(props){
        // default values
        var leftItemActive = this.state.leftItemActive
        var topItemActive = null
        var contentItemsActive = []

        // get url parameters if provided
        props.match.params.leftItem && (leftItemActive = props.match.params.leftItem)
        props.match.params.topItem && (topItemActive = props.match.params.topItem)
        props.match.params.contentItems && (contentItemsActive = props.match.params.contentItems)

        fetch('data/left-items.json') // get left menu items
            .then((response) => response.json())
            .then((response) => {
                this.setState({leftItems: response})
                !leftItemActive && (leftItemActive = response[0].alias) // if nothing is selected - use the first
                return fetch('data/top-items-'+leftItemActive+'.json') // get tabs for current menu item
            })
            .then((response) => response.json())
            .then((response) => {
                this.setState({topItems: response})
                !topItemActive && (topItemActive = response[0].alias) // if nothing is selected - use the first
                return fetch('data/elements-'+topItemActive+'.json') // get content elements
            })
            .then((response) => response.json())
            .then((response) => {
                this.setState({contentItems: response})
        
                // store state to application
                this.setState({
                    leftItemActive: leftItemActive,
                    topItemActive: topItemActive,
                    contentItemsActive: contentItemsActive
                })
            })
      }
    
    render(){
        return (
            <div className="container">
                <div className="row row-offcanvas row-offcanvas-right">
                    <SidebarNavigation items={this.state.leftItems} active={this.state.leftItemActive} />
                    <div className="col-xs-12 col-sm-9">
                        <TopNavigation items={this.state.topItems}
                                    active={this.state.topItemActive}
                                    leftActive={this.state.leftItemActive} />
                        <div className="row">
                            <div className="col-xs-12">
                                <ContentArea items={this.state.contentItems}
                                            active={this.state.contentItemsActive}
                                            leftActive={this.state.leftItemActive}
                                            topActive={this.state.topItemActive}  />
                            </div>
                        </div>
                    </div>
                </div>
                <hr />
            </div>
        )
    }
}

ReactDOM.render(
    <HashRouter>
        <Route exact path='/:leftItem?/:topItem?/:contentItems?' component={App} />
    </HashRouter>,
    document.getElementById("root")
)