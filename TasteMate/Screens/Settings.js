import React from 'react';
import {Alert, Button, SafeAreaView, ScrollView, Text, View} from 'react-native';
import {NavBarLogoutButton} from "../Components/NavBarButton";
import strings from "../strings";
import {TextInputComponent} from "../Components/TextInputComponent";
import {
    _addPictureToStorage,
    _formatUsername,
    _handleAuthError,
    brandAccent,
    brandBackground,
    brandContrast,
    maxUsernameLength,
    pathUsers
} from "../constants/Constants";
import styles from "../styles";
import {SettingsSwitchComponent} from "../Components/SettingsSwitchComponent";
import {currentUser, currentUserInformation} from "../App";
import firebase from 'react-native-firebase';
import {CameraCameraRollComponent} from "../Components/CameraCameraRollComponent";
import {ActivityIndicatorComponent} from "../Components/ActivityIndicatorComponent";
import {UserImageThumbnailComponent} from "../Components/UserImageThumbnailComponent";
import {ImageCacheManager} from 'react-native-cached-image'
import {icons} from "../Attributions";

const ICM = new ImageCacheManager();

export class SettingsScreen extends React.Component {
    static navigationOptions =({navigation})=> ({
        title: strings.settings + ' ',
        headerRight: (
            <NavBarLogoutButton nav={navigation}/>
        ),
    });

    constructor(props) {
        super(props);
        this._onLikeNotificationChange = this._onLikeNotificationChange.bind(this);
        this._onWantToEatNotificationChange = this._onWantToEatNotificationChange.bind(this);
        this._onShareNotificationChange = this._onShareNotificationChange.bind(this);
        this._onFollowNotificationChange = this._onFollowNotificationChange.bind(this);
        this._onPressSave = this._onPressSave.bind(this);
        this._updateUserInfoInDatabase = this._updateUserInfoInDatabase.bind(this);
        this._onImageSelected = this._onImageSelected.bind(this);
        this._startActivityIndicator = this._startActivityIndicator.bind(this);
        this._stopActivityIndicator = this._stopActivityIndicator.bind(this);
        this._setActivityIndicatorText = this._setActivityIndicatorText.bind(this);
        this._closeSettings = this._closeSettings.bind(this);
        this._clearImageCacheAndClose = this._clearImageCacheAndClose.bind(this);

        // TODO [FEATURE]: Let user change his password
        // TODO [FEATURE]: Action on notification preferences set
        this.state = {
            email: currentUser ? currentUser.email : '',
            username: currentUserInformation.username,
            location: currentUserInformation.location,
            oldPassword: '',
            newPassword: '',
            newPasswordRepeat: '',
            followNotification: true,
            likeNotification: true,
            wantToEatNotification: true,
            shareNotification: true,
            getPictureActive: false,
            imageUrl: currentUserInformation.imageUrl,
            newImageUrl: '',
            loadingIndicatorVisible: false,
            loadingIndicatorText: ''
        };
    }

    _onLikeNotificationChange(){
        this.setState({likeNotification: !this.state.likeNotification});
    }

    _onWantToEatNotificationChange(){
        this.setState({wantToEatNotification: !this.state.wantToEatNotification});
    }

    _onShareNotificationChange(){
        this.setState({shareNotification: !this.state.shareNotification});
    }

    _onFollowNotificationChange(){
        this.setState({followNotification: !this.state.followNotification});
    }

    _startActivityIndicator(text) {
        if (!this.state.loadingIndicatorVisible) {
            this.setState({loadingIndicatorVisible: true});
            this._setActivityIndicatorText(text);
        }
    }

    _stopActivityIndicator() {
        if (this.state.loadingIndicatorVisible) {
            this.setState({loadingIndicatorVisible: false});
            this._setActivityIndicatorText('');
        }
    }

    _setActivityIndicatorText(text) {
        this.setState({loadingIndicatorText: text});
    }

    _onPressSave() {
        let errorMessage = '';
        if (!this.state.username) {
            errorMessage = strings.errorMessageEnterUsername;
        } else if (!this.state.location) {
            errorMessage = strings.errorMessageEnterLocation;
        } else {
            let userInfoChange = {};
            let changes = false;
            if (this.state.username !== currentUserInformation.username) {
                userInfoChange.username = this.state.username;
                changes = true;
            }
            if (this.state.location !== currentUserInformation.location) {
                userInfoChange.location = this.state.location;
                changes = true;
            }

            if (changes) {
                this._startActivityIndicator(strings.savingProfile);
                if (userInfoChange.username) {
                    console.log('Checking if username already exists...');
                    this._setActivityIndicatorText(strings.checkingUsername);
                    const refUsername = firebase.database().ref(pathUsers).orderByChild('username').equalTo(userInfoChange.username);
                    refUsername.once('value')
                        .then((dataSnapshot) => {
                            console.log('Username successfully checked');
                            if (dataSnapshot.toJSON()) {
                                // Display error message
                                this._stopActivityIndicator();
                                _handleAuthError(strings.errorMessageUsernameAlreadyInUse, this._showErrorPopup);
                            } else {
                                this._updateUserInfoInDatabase(userInfoChange);
                            }
                        }).catch((error) => {
                            console.log('Error while checking if username exists');
                            this._stopActivityIndicator();
                            console.log(error);
                        }
                    );
                } else {
                    this._updateUserInfoInDatabase(userInfoChange);
                }
            } else if (this.state.newImageUrl) {
                this._startActivityIndicator(strings.savingProfile);
                this._uploadNewPicture();
            }

        }
        this._showErrorPopup(errorMessage);
    }

    _uploadNewPicture() {
        if (this.state.newImageUrl) {
            currentUserInformation.imageUrl = this.state.newImageUrl;
            const userRef = firebase.database().ref(pathUsers).child(currentUser.uid);
            _addPictureToStorage('/' + pathUsers + '/' + currentUser.uid + '.jpg', this.state.newImageUrl, userRef, this._clearImageCacheAndClose, this._setActivityIndicatorText, this._stopActivityIndicator);
        } else {
            this._closeSettings();
        }
    }

    _clearImageCacheAndClose(url) {
        console.log('Clearing image url cache...');
        ICM.deleteUrl(currentUserInformation.imageUrl, {})
            .then(() => {
                console.log('Successfully cleared image url cache');
                currentUserInformation.imageUrl = url;
                this._closeSettings();
            }).catch((error) => {
            console.log('Error while clearing image url cache');
            console.log(error);
        });
    }

    _closeSettings() {
        this.props.navigation.getParam('onDataChangedAction')();
        this.props.navigation.goBack();
    }

    _showErrorPopup(message) {
        if (message) {
            Alert.alert(strings.missingValuesTitle, message,
                [
                    {text: strings.ok},
                ]
            );
        }
    }

    _updateUserInfoInDatabase(userInfo) {
        this._setActivityIndicatorText(strings.savingProfile);
        firebase.database().ref(pathUsers).child(currentUser.uid).update(userInfo)
            .then(() => {
                console.log('Successfully updated user information on DB.');
                if (userInfo.username) {
                    currentUserInformation.username = userInfo.username;
                }
                if (userInfo.location) {
                    currentUserInformation.location = userInfo.location.trim();
                }

                this._uploadNewPicture();
            }).catch((error) => {
                console.error('Error during user information update transmission.');
                this._stopActivityIndicator();
                console.error(error);
                _handleAuthError(error, this._showErrorPopup);
            }
        );
    }

    _selectNewProfilePicture() {
        this.setState({getPictureActive: true});
    }

    _onImageSelected(uri) {
        this.setState({
            newImageUrl: uri,
            getPictureActive: false
        });
    }

    _onPressViewAttributions () {
        let message = '';
        for (let i = 0; i < icons.length; i++) {
            message += icons[i] + '\n';
        }

        Alert.alert(strings.attributions, message,
            [
                {text: strings.ok},
            ]
        );
    }

    render() {
        return (
            <SafeAreaView style={{flex:1}}>
                {
                    !this.state.getPictureActive &&
                    <ScrollView style={[{flex: 1}]}>
                        <UserImageThumbnailComponent size={styles.roundProfileLarge} uri={this.state.newImageUrl || this.state.imageUrl} onPress={this._selectNewProfilePicture.bind(this)} />
                        <View name={'inputWrapper'} style={styles.containerPadding}>
                            <TextInputComponent
                                fontawesome={true}
                                editable={false}
                                placeholder={strings.emailAddress}
                                value={this.state.email}
                                onChangeText={(text) => this.setState({email: text})}
                                icon={'envelope'}
                                keyboardType={'email-address'}
                            />
                            <TextInputComponent
                                fontawesome={true}
                                placeholder={strings.username}
                                value={this.state.username}
                                onChangeText={(text) => this.setState({username: _formatUsername(text)})}
                                icon={'user'}
                                keyboardType={'default'}
                                maxLength={maxUsernameLength}
                            />
                            <TextInputComponent
                                fontawesome={true}
                                placeholder={strings.location}
                                value={this.state.location}
                                onChangeText={(text) => this.setState({location: text})}
                                icon={'location-arrow'}
                                keyboardType={'default'}
                            />
                            {/*<TextInputComponent
                            fontawesome={true}*/}
                            {/*placeholder={strings.oldPassword}*/}
                            {/*icon={'lock'}*/}
                            {/*onChangeText={(text) => this.setState({oldPassword: text})}*/}
                            {/*keyboardType={'default'}*/}
                            {/*secureTextEntry={true}*/}
                            {/*/>*/}
                            {/*<TextInputComponent fontawesome={true}*/}
                            {/*placeholder={strings.newPassword}*/}
                            {/*icon={'lock'}*/}
                            {/*onChangeText={(text) => this.setState({newPassword: text})}*/}
                            {/*keyboardType={'default'}*/}
                            {/*secureTextEntry={true}*/}
                            {/*/>*/}
                            {/*<TextInputComponent fontawesome={true}*/}
                            {/*placeholder={strings.newPasswordRepeat}*/}
                            {/*icon={'lock'}*/}
                            {/*onChangeText={(text) => this.setState({newPasswordRepeat: text})}*/}
                            {/*keyboardType={'default'}*/}
                            {/*secureTextEntry={true}*/}
                            {/*/>*/}
                        </View>
                        <View name={'switchWrapper'} style={styles.containerPadding}>
                            <View style={[{flex: 1, backgroundColor:brandBackground}, styles.rightRoundedEdges, styles.leftRoundedEdges]}>
                                <View style={styles.containerPadding}>
                                    <Text name={'notificationsTitle'} style={[styles.textTitle]}>{strings.notifyMe}</Text>
                                </View>
                                <SettingsSwitchComponent selected={this.state.likeNotification} onPress={this._onLikeNotificationChange} text={strings.likesPicture}/>
                                <SettingsSwitchComponent selected={this.state.wantToEatNotification} onPress={this._onWantToEatNotificationChange} text={strings.addsToEatingOutPicture}/>
                                <SettingsSwitchComponent selected={this.state.shareNotification} onPress={this._onShareNotificationChange} text={strings.sharesPicture}/>
                                <SettingsSwitchComponent selected={this.state.followNotification} onPress={this._onFollowNotificationChange} text={strings.startsFollowing}/>
                            </View>
                        </View>
                        <View name={'saveButtonWrapper'} style={[styles.containerPadding, {flex: 1}]}>
                            <Button name={'saveChangesButton'} onPress={this._onPressSave} title={strings.saveChanges} color={brandAccent}/>
                        </View>
                        <View name={'viewAttributions'} style={[styles.containerPadding, {flex: 1}]}>
                            <Button name={'saveChangesButton'} onPress={this._onPressViewAttributions} title={strings.viewAttributions} color={brandContrast}/>
                        </View>
                    </ScrollView>
                }
                {
                    this.state.getPictureActive &&
                    <CameraCameraRollComponent onImageSelectedAction={this._onImageSelected}/>
                }
                {
                    this.state.loadingIndicatorVisible &&
                    <ActivityIndicatorComponent visible={this.state.loadingIndicatorVisible} text={this.state.loadingIndicatorText}/>
                }
            </SafeAreaView>
        );
    }
}
