import React from "react";
import {
    ActionSheetIOS,
    Alert,
    FlatList,
    Image,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {
    _formatNumber,
    _navigateToScreen,
    ActivityEnum,
    brandContrast,
    brandLight,
    brandMain,
    EmojiEnum,
    iconSizeSmall,
    iconSizeStandard
} from "../constants/Constants";
import styles from "../styles";
import {adjectives, comments} from "../MockupData";
import TimeAgo from "react-native-timeago";
import {CommentComponent} from "./CommentComponent";
import strings from "../strings";
import Share from 'react-native-share';

export class ObservationComponent extends React.Component {
    constructor(props) {
        super(props);
        this._onPressMenuButton = this._onPressMenuButton.bind(this);
        this._onPressMenuDetailButton = this._onPressMenuDetailButton.bind(this);
        this._onPressLocationText = this._onPressLocationText.bind(this);
        this._onPressShareButton = this._onPressShareButton.bind(this);
        this._onPressProfile = this._onPressProfile.bind(this);
        this.state = {overlayIsHidden: true};
        this.observation = this.props.observation;
    }

    _onPressLikeButton() {
        // TODO: Like action
    }

    _onPressCutleryButton() {
        // TODO: Cutlery action
    }

    _onPressSendButton() {
        // TODO: Send action
    }

    _onPressLocationText() {
        this.props.navigation.navigate('Map', {observation: this.observation});
    }

    _onPressMenuButton() {
        // TODO: Only show menu when it is my own post
        const title = strings.selectAction;
        const message = strings.formatString(strings.doWithPost, this.observation.dishname, this.observation.userid);
        const options = [
            strings.edit,
            strings.delete,
            strings.cancel
        ];
        const cancelButtonIndex = 2;
        const destructiveButtonIndex = 1;

        if (Platform.OS === 'android') {
            Alert.alert(title, message,
                [
                    {text: strings.cancel, onPress: () => this._onPressMenuDetailButton(cancelButtonIndex), style: 'cancel'},
                    {text: strings.edit, onPress: () => this._onPressMenuDetailButton(0)},
                    {text: strings.delete, onPress: () => this._onPressMenuDetailButton(destructiveButtonIndex)},
                ]
            );
        } else if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions({
                    title: title,
                    message: message,
                    options: options,
                    cancelButtonIndex: cancelButtonIndex,
                    destructiveButtonIndex: destructiveButtonIndex,
                },
                (buttonIndex) => {
                    this._onPressMenuDetailButton(buttonIndex);
                });
        }
    }

    _onPressMenuDetailButton(buttonIndex) {
        if (buttonIndex === 0) {
            this.props.navigation.navigate('CreateObservation', {observation: this.observation});
        } else if (buttonIndex === 1) {
            // TODO: Delete obs
        }
    }

    async _onPressShareButton() {
        // TODO: What is being shared? Link?
        Share.open({
            title: strings.share,
            subject: strings.shareSubject,
            message: strings.shareMessage,
            dialogTitle: strings.shareDialogTitle,
            url: ''//this.observation.image,
        }).catch(
            (err) => {
                err && console.log(err);
            }
        );
    }

    _toggleOverlay() {
        this.setState(previousState => {
            return { overlayIsHidden: !previousState.overlayIsHidden };
        });
    }

    _onPressProfile() {
        _navigateToScreen('Profile', this.props.navigation, this.observation.userid, null);
    }

    _keyExtractor = (item, index) => item.key;

    render() {
        let adjs = '';
        for (let i = 0; i < adjectives.length; i++) {
            adjs = adjs + '#' + adjectives[i].value.adjective + ' ';
        }

        return (
            <View name={'wrapper'} style={{flex:1}} >
                <View name={'header'} style={{flexDirection:'row'}}>
                    <TouchableOpacity name={'header'} onPress={this._onPressProfile} style={[styles.containerPadding, {flex: 0, flexDirection:'column'}]}>
                        <Image name={'userprofilepic'} resizeMode={'cover'} source={require('../user2.jpg')} style={styles.roundProfile}/>
                    </TouchableOpacity>
                    <View name={'header'} style={[styles.containerPadding, {flex: 1, flexDirection:'column'}]}>
                        <View name={'header'} style={{flex: 1, flexDirection:'row'}}>
                            <Text name={'dishnames'} >
                                <Text name={'dishname'} style={styles.textTitleBoldDark}>{this.observation.dishname}</Text>
                                <Text name={'mypoc'} style={styles.textTitle}> ({this.observation.mypoc})</Text>
                            </Text>
                        </View>
                        <Text name={'location'} style={[styles.textSmall, {flex: 1}]} onPress={this._onPressLocationText}>{this.observation.location.name}</Text>
                    </View>
                    <FontAwesome name={'ellipsis-v'} size={iconSizeStandard} color={brandContrast} style={styles.containerPadding} onPress={this._onPressMenuButton}/>
                </View>
                <View name={'picture'} style={{flexDirection:'row'}}>
                    <TouchableOpacity onPress={this._toggleOverlay.bind(this)} style={{flex: 1, aspectRatio: 1}}>
                        <Image name={'image'} resizeMode={'contain'} source={require('../carbonara.png')} style={{flex: 1, aspectRatio: 1}}/>
                    </TouchableOpacity>
                    <View style={[styles.containerOpacity, {position: 'absolute'}]}>
                        <Text name={'smiley'} style={[styles.textTitleBoldDark, styles.containerPadding]}>{EmojiEnum[this.observation.rating]}</Text>
                    </View>
                    <View style={[styles.containerOpacity, {position: 'absolute', right:0, flexWrap:'wrap'}]}>
                        <Text name={'price'} style={[styles.textTitleBoldDark, styles.containerPadding]}>{this.observation.currency} {this.observation.price}</Text>
                    </View>
                    <View style={[styles.containerOpacity, {padding: 6, position: 'absolute', bottom: 0, flexDirection:'row'}]}>
                        <TouchableOpacity style={styles.containerPadding} onPress={this._onPressLikeButton}>
                            <FontAwesome name={'thumbs-o-up'} size={iconSizeStandard} color={brandContrast}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.containerPadding} onPress={this._onPressCutleryButton}>
                            <FontAwesome name={'cutlery'} size={iconSizeStandard} color={brandContrast}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.containerPadding} onPress={this._onPressShareButton}>
                            <FontAwesome name={'share'} size={iconSizeStandard} color={brandContrast}/>
                        </TouchableOpacity>
                    </View>
                    {!this.state.overlayIsHidden &&
                    <ScrollView style={[styles.containerOpacityDark, {position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}]} contentContainerStyle={{flexGrow: 1}}>
                        <TouchableOpacity name={'adjectivesoverlay'} onPress={this._toggleOverlay.bind(this)} style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={[styles.textLargeBoldLight, styles.containerPadding, {textAlign:'center'}]} adjustsFontSizeToFit={true} allowFontScaling={true}>{adjs} </Text>
                        </TouchableOpacity>
                    </ScrollView>
                    }
                </View>
                <View name={'description'} style={[styles.containerPadding, styles.bottomLine, {flexDirection:'column'}]}>
                    <Text name={'description'} style={styles.textStandardDark}>{this.observation.description}</Text>
                    {/*TODO: enable clicking on likes/cutleries to see who liked/cutleried/shared*/}
                    <View name={'information'} style={{flexDirection: 'row'}}>
                        <TimeAgo name={'time'} style={styles.textSmall} time={this.observation.timestamp}/>
                        <Text name={'details'} style={styles.textSmall}> • {_formatNumber(this.observation.likes, ActivityEnum.LIKE)} • {_formatNumber(this.observation.cutleries, ActivityEnum.CUTLERY)} • {_formatNumber(this.observation.shares, ActivityEnum.SHARE)}</Text>
                    </View>
                </View>
                <FlatList name={'comments'} style={[styles.containerPadding, {flex: 1, flexDirection:'column'}]}
                          data={comments}
                          keyExtractor={this._keyExtractor}
                          renderItem={({item}) => <CommentComponent comment={item.value} {...this.props}/>}
                          ListFooterComponent={() =>
                              <View style={{flex: 1, flexDirection:'row', alignItems: 'center'}}>
                                  <Image name={'userpic'} style={[styles.roundProfileSmall, styles.containerPadding]} resizeMode={'cover'} source={require('../user2.jpg')} />
                                  <TextInput style={[styles.textStandardDark, styles.containerPadding, {flex: 1}]} placeholder={strings.writeComment} placeholderTextColor={brandLight} returnKeyType={'send'} keyboardType={'default'} underlineColorAndroid={brandContrast} selectionColor={brandMain} onSubmitEditing={this._onPressSendButton}/>
                                  <TouchableOpacity onPress={this._onPressSendButton}>
                                      <FontAwesome name={'send'} size={iconSizeSmall} color={brandContrast}/>
                                  </TouchableOpacity>
                              </View>
                          }
                />
            </View>
        );
    }
}
// TODO: Hide comments if more than 2