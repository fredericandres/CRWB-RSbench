import React from 'react';
import {Text, View} from 'react-native';
import {NavBarCreateObsButton, NavBarProfileButton} from "./NavBarButton";

export class SearchExploreScreen extends React.Component {
    static navigationOptions = ({navigation})=> ({
        title: 'Explore',
        headerLeft: (
            <NavBarProfileButton nav={navigation}/>
        ),
        headerRight: (
            <NavBarCreateObsButton nav={navigation}/>
        ),
    });

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Search Screen</Text>
            </View>
        );
    }
}
