import React from "react";
import styles from "../styles";
import {Image, Text, TouchableOpacity, View, Animated} from "react-native";
import TimeAgo from 'react-native-timeago'
import {_navigateToScreen, brandAccent, brandMain} from "../constants/Constants";
import strings from "../strings";

export class NotificationComponent extends React.Component {
    constructor(props) {
        super(props);
        this._onPressProfile = this._onPressProfile.bind(this);
        this._onPresObservation = this._onPresObservation.bind(this);
        this.notification = this.props.notification;
        this.state = {
            fadeAnim: new Animated.Value(1)
        }
    }

    componentDidMount() {
        Animated.timing(                  // Animate over time
            this.state.fadeAnim,            // The animated value to drive
            {
                toValue: 0,                   // Animate to opacity: 1 (opaque)
                duration: 10000,              // Make it take a while
            }
        ).start();
    }

    _onPressMultipleProfiles() {
        // TODO: When more than 2 people --> clicking on names leads to a list of users
    }

    _onPressProfile(index) {
        _navigateToScreen('Profile', this.props.nav, this.notification.senderid[index], null);
    }

    _onPresObservation() {
        this.props.nav.navigate('ObservationDetail',  { observation: this.notification.observationid });
    }

    render() {
        let action = '';
        switch(this.notification.type) {
            case 'LIKE':
                action = strings.likedPicture;
                break;
            case 'WANTTOEAT':
                action = strings.addedToEatingOutPicture;
                break;
            case 'SHARE':
                action = strings.sharedPicture;
                break;
            case 'FOLLOW':
                action = strings.startedFollowing;
                break;
        }

        let completeActionString = '';
        if (this.notification.senderid.length === 1) {
            completeActionString = strings.formatString(action, this.notification.senderid[0]);
        } else if (this.notification.senderid.length === 2) {
            completeActionString = strings.formatString(action, strings.formatString(strings.userAndUser, this.notification.senderid[0], this.notification.senderid[1]));
        } else {
            completeActionString = strings.formatString(action, strings.formatString(strings.userAndUser, this.notification.senderid[0], strings.formatString(strings.others, this.notification.senderid.length - 1)));
        }

        return (
            <TouchableOpacity onPress={this.notification.type === 'FOLLOW' ? this._onPressProfile : this._onPresObservation} style={[{flexDirection:'row'}]}>
                {!this.notification.read && <Animated.View name={'fadingbackground'} style={{position: 'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:brandMain, opacity: this.state.fadeAnim}}/>}
                <TouchableOpacity name={'userpic'} onPress={this.notification.senderid.length === 1 ? () => this._onPressProfile(0) : this._onPressMultipleProfiles} style={[styles.containerPadding, {flexDirection:'column', justifyContent:'center'}]}>
                    <Image name={'userprofilepic'} resizeMode={'cover'} source={require('../user2.jpg')} style={styles.roundProfile}/>
                </TouchableOpacity>
                <View name={'textcontentwrapper'} style={[styles.containerPadding, {flex: 1, flexDirection:'column', justifyContent:'center'}]}>
                    <Text name={'action'}>
                        <Text onPress={() => this._onPressProfile(0)} style={styles.textStandardBold}>{completeActionString/*this.notification.senderid[0]*/}</Text>
                        {/*
                            (this.notification.senderid.length > 1) &&
                            <Text style={styles.textStandardDark}> and </Text>
                        }
                        {
                            (this.notification.senderid.length === 2) &&
                            <Text onPress={() => this._onPressProfile(1)} style={styles.textStandardBold}>{this.notification.senderid[1]}</Text>
                        }
                        {
                            (this.notification.senderid.length > 2) &&
                            <Text onPress={this._onPressMultipleProfiles} style={styles.textStandardBold}>{_formatNumber(this.notification.senderid.length - 1)} others</Text>
                                                <Text style={[styles.textStandardDark]}> {action}</Text>*/}
                    </Text>
                    <TimeAgo name={'time'} style={styles.textSmall} time={this.notification.timestamp}/>
                </View>
                {this.notification.type !== 'FOLLOW' &&
                <TouchableOpacity name={'image'} onPress={this._onPresObservation} style={[styles.containerPadding, {flex: 0, flexDirection:'column', justifyContent:'center'}]}>
                    <Image name={'userprofilepic'} resizeMode={'cover'} source={require('../carbonara.png')} style={styles.squareThumbnail}/>
                </TouchableOpacity>}
            </TouchableOpacity>
        );
    }
}