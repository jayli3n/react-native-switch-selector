/**
Original creators: https://github.com/App2Sales/react-native-switch-selector
Modified for my own use to allow for custom fonts, sizes and colors
**/
import React, { Component } from 'react';
import {
  Animated,
  Easing,
  I18nManager,
  Image,
  PanResponder,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  colorPicker,
  fontSizePicker,
  fontFamilyPicker
} from './helper';


const styles = {
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  containerButton: {
    flexDirection: 'row',
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  animated: {
    borderWidth: 0,
    position: 'absolute'
  }
};

export default class AwsmSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.initial ? this.props.initial : 0
    };
    this.animatedValue = new Animated.Value(
      this.props.initial
        ? I18nManager.isRTL
          ? -(this.props.initial / this.props.options.length)
          : this.props.initial / this.props.options.length
        : 0
    );
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.shouldSetResponder,
      onMoveShouldSetPanResponder: this.shouldSetResponder,
      onPanResponderRelease: this.responderEnd,
      onPanResponderTerminate: this.responderEnd
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.toggleItem(nextProps.value, !this.props.disableValueChangeOnPress);
    }
  }

  getBgColor(bgColor) {
    const { selected } = this.state;
    const { options, buttonColor } = this.props;
    return options[selected].activeColor || buttonColor || bgColor;
  }

  _getSwipeDirection(gestureState) {
    const { dx, dy, vx } = gestureState;
    // 0.1 velocity
    if (Math.abs(vx) > 0.1 && Math.abs(dy) < 80) {
      return dx > 0 ? 'RIGHT' : 'LEFT';
    }
    return null;
  }

  responderEnd = (evt, gestureState) => {
    if (this.props.disabled) return;
    const swipeDirection = this._getSwipeDirection(gestureState);
    if (
      swipeDirection === 'RIGHT' &&
      this.state.selected < this.props.options.length - 1
    ) {
      this.toggleItem(this.state.selected + 1);
    } else if (swipeDirection === 'LEFT' && this.state.selected > 0) {
      this.toggleItem(this.state.selected - 1);
    }
  };

  shouldSetResponder = (evt, gestureState) => {
    return (
      evt.nativeEvent.touches.length === 1 &&
      !(Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5)
    );
  };

  animate = (value, last) => {
    this.animatedValue.setValue(last);
    Animated.timing(this.animatedValue, {
      toValue: value,
      duration: this.props.animationDuration,
      easing: Easing.cubic,
      useNativeDriver: true
    }).start();
  };

  toggleItem = (index, callOnPress = true) => {
    const { options, returnObject, onPress } = this.props;
    if (options.length <= 1 || index === null || isNaN(index)) return;
    this.animate(
      I18nManager.isRTL ? -(index / options.length) : index / options.length,
      I18nManager.isRTL
        ? -(this.state.selected / options.length)
        : this.state.selected / options.length
    );
    if (callOnPress && onPress) {
      onPress(returnObject ? options[index] : options[index].value);
    } else {
      console.log('AwsmSelector onPress with value: ', options[index].value);
    }
    this.setState({ selected: index });
  };

  render() {
    const {
      style,
      textStyle,
      selectedTextStyle,
      imageStyle,
      textColor,
      selectedColor,
      textFontSize,
      textLineHeight,
      textFontFamily,
      backgroundColor,
      borderColor,
      borderRadius,
      borderWidth,
      disabled,
      size,
      buttonHeight,
      tight,
      rounded,
      type
    } = this.props;

    // Modifying color of button
    const { fgColor, bgColor, fgColorInverse } = colorPicker(type);
    // Get font size and line height based on size prop
    const { fFamily } = fontFamilyPicker(14); // 14 is button font
    const { fSize, lHeight } = fontSizePicker(size);
    const fontSize = textFontSize || fSize;
    const lineHeight = textLineHeight || lHeight;
    // Working out the the padding and height of btn based on content size
    const height = buttonHeight || fontSize * 3;

    const options = this.props.options.map((element, index) => (
      <TouchableOpacity
        key={index}
        disabled={disabled}
        style={styles.button}
        onPress={() => this.toggleItem(index)}
        activeOpacity={0.5}
      >
        {typeof element.customIcon === 'function'
          ? element.customIcon(this.state.selected === index)
          : element.customIcon}
        {element.imageIcon && (
          <Image
            source={element.imageIcon}
            style={[
              {
                height: 30,
                width: 30,
                tintColor:
                  this.state.selected === index ? selectedColor || fgColor
                  : textColor || fgColorInverse
              },
              imageStyle
            ]}
          />
        )}
        <Text
          style={[
            {
              fontSize,
              lineHeight,
              fontFamily: textFontFamily || fFamily,
              textAlign: 'center',
              color: this.state.selected === index ? selectedColor || fgColor
              : textColor || fgColorInverse,
              backgroundColor: 'transparent'
            },
            this.state.selected === index ? selectedTextStyle : textStyle
          ]}
        >
          {element.label}
        </Text>
      </TouchableOpacity>
    ));

    return (
      <View style={[{ flexDirection: 'row' }, style]}>
        <View {...this._panResponder.panHandlers} style={{ flex: 1 }}>
          <View
            style={{
              borderRadius: rounded ? height / 2 : borderRadius,
              backgroundColor: backgroundColor || fgColor,
              height: tight ? height * (2.2 / 3) : height
            }}
            onLayout={event => {
              const { width } = event.nativeEvent.layout;
              this.setState({
                sliderWidth: width
              });
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                borderColor,
                borderRadius: rounded ? height / 2 : borderRadius,
                borderWidth
              }}
            >
              {!!this.state.sliderWidth && (
                <Animated.View
                  style={[
                    {
                      height: tight ? height * (2.2 / 3) : height,
                      backgroundColor: this.getBgColor(bgColor),
                      width:
                        this.state.sliderWidth / this.props.options.length,
                      transform: [
                        {
                          translateX: this.animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, this.state.sliderWidth]
                          })
                        }
                      ],
                      borderRadius: rounded ? height / 2 : borderRadius,
                    },
                    styles.animated
                  ]}
                />
              )}
              {options}
            </View>
          </View>
        </View>
      </View>
    );
  }
}

AwsmSelector.defaultProps = {
  style: {},
  textStyle: {},
  selectedTextStyle: {},
  imageStyle: {},
  borderRadius: 13,
  returnObject: false,
  animationDuration: 100,
  disabled: false,
  disableValueChangeOnPress: false
};
