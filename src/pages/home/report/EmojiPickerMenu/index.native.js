import React, {Component} from 'react';
import {View, FlatList} from 'react-native';
import PropTypes from 'prop-types';
import compose from '../../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import CONST from '../../../../CONST';
import styles from '../../../../styles/styles';
import emojis from '../../../../../assets/emojis';
import EmojiPickerMenuItem from '../EmojiPickerMenuItem';
import ExpensifyText from '../../../../components/ExpensifyText';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import EmojiSkinToneList from '../EmojiSkinToneList';
import * as EmojiUtils from '../../../../libs/EmojiUtils';

const propTypes = {
    /** Function to add the selected emoji to the main compose text input */
    onEmojiSelected: PropTypes.func.isRequired,

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** Function to sync the selected skin tone with parent, onyx and nvp */
    updatePreferredSkinTone: PropTypes.func,

    /** User's frequently used emojis */
    frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.shape({
        code: PropTypes.string.isRequired,
        keywords: PropTypes.arrayOf(PropTypes.string),
    })).isRequired,


    /** Props related to the dimensions of the window */
    ...windowDimensionsPropTypes,

    /** Props related to translation */
    ...withLocalizePropTypes,
};

class EmojiPickerMenu extends Component {
    constructor(props) {
        super(props);

        // This is the number of columns in each row of the picker.
        // Because of how flatList implements these rows, each row is an index rather than each element
        // For this reason to make headers work, we need to have the header be the only rendered element in its row
        // If this number is changed, emojis.js will need to be updated to have the proper number of spacer elements
        // around each header.
        this.numColumns = CONST.EMOJI_NUM_PER_ROW;

        this.emojis = EmojiUtils.mergeEmojisWithFrequentlyUsedEmojis(emojis, this.props.frequentlyUsedEmojis);

        // This is the indices of each category of emojis
        // The positions are static, and are calculated as index/numColumns (8 in our case)
        // This is because each row of 8 emojis counts as one index
        this.unfilteredHeaderIndices = EmojiUtils.getDynamicHeaderIndices(this.emojis);

        this.renderItem = this.renderItem.bind(this);
        this.isMobileLandscape = this.isMobileLandscape.bind(this);
    }


    /**
     * Check if its a landscape mode of mobile device
     *
     * @returns {Boolean}
     */
    isMobileLandscape() {
        return this.props.windowWidth >= this.props.windowHeight;
    }


    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "SPACER" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly
     *
     * @param {Object} item
     * @returns {*}
     */
    renderItem({item}) {
        const {code, types} = item;
        if (item.code === CONST.EMOJI_SPACER) {
            return null;
        }

        if (item.header) {
            return (
                <ExpensifyText style={styles.emojiHeaderStyle}>
                    {item.code}
                </ExpensifyText>
            );
        }

        const emojiCode = types && types[this.props.preferredSkinTone]
            ? types[this.props.preferredSkinTone]
            : code;


        return (
            <EmojiPickerMenuItem
                onPress={emoji => this.props.onEmojiSelected(emoji, item)}
                emoji={emojiCode}
            />
        );
    }


    render() {
        return (
            <View style={styles.emojiPickerContainer}>
                <FlatList
                    data={this.emojis}
                    renderItem={this.renderItem}
                    keyExtractor={item => (`emoji_picker_${item.code}`)}
                    numColumns={this.numColumns}
                    style={[
                        styles.emojiPickerList,
                        this.isMobileLandscape() && styles.emojiPickerListLandscape,
                    ]}
                    stickyHeaderIndices={this.unfilteredHeaderIndices}
                />
                <EmojiSkinToneList
                    updatePreferredSkinTone={this.props.updatePreferredSkinTone}
                    preferredSkinTone={this.props.preferredSkinTone}
                />
            </View>
        );
    }
}

EmojiPickerMenu.propTypes = propTypes;
EmojiPickerMenu.defaultProps = {
    preferredSkinTone: undefined,
    updatePreferredSkinTone: undefined,
};

export default compose(
    withWindowDimensions,
    withLocalize,
)(React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <EmojiPickerMenu {...props} forwardedRef={ref} />
)));
