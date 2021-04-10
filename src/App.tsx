import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Nav from './components/Nav';

import Group from './components/Group';
import Pool from './components/Pool';
import Profile from './components/Profile';
import CreatePool from './components/CreatePool';
import CreateGroup from './components/CreateGroup';
import Groups from './components/Groups';
import MyGroups from './components/MyGroups';
import MyPools from './components/MyPools';
import UpdatePool from './components/UpdatePool';
import Home from './components/Home';
import Main from './components/Main';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './App.css';
import Authenticator from './components/Authenticator';

function App() {
	return (
		<div className="App">
			<BrowserRouter>
				<Nav />
				<Switch>
					<Route component={Main} path="/about" />
					<Route component={Authenticator} path="/auth/:provider/callback" />
					<Route component={CreatePool} path="/create_pool" />
					<Route component={CreateGroup} path="/create_group" />
					<Route component={Groups} path="/groups" />
					<Route component={MyGroups} path="/mygroups" />
					<Route component={MyPools} path="/mypools" />
					<Route component={UpdatePool} path="/update_pool" />
					<Route component={Group} path="/group/:id" />
					<Route component={Pool} path="/pool/:id" />
					<Route component={Profile} path="/profile" />
					<Route component={Home} path="/" />
				</Switch>
			</BrowserRouter>
		</div>
	);
}

export default App;
