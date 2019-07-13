/**
Original creators: https://github.com/App2Sales/react-native-switch-selector
My fork: https://github.com/jayli3n/react-native-switch-selector
Modified for my own use to allow for custom styles, animations and features
**/
import React, { Component } from 'react';
import {
  Animated,
  Easing,
  I18nManager,
  PanResponder,
  TouchableOpacity,
  View
} from 'react-native';
import AwsmText from './AwsmText';
import {
  colorPicker,
  fontSizePicker
} from './helper';
import {
  BORDER_RADIUS
} from '../constants';

/**
PROPS:
  style,
  selectedTextColor,
  borderColor,
  borderWidth,
  disabled,
  size,
  buttonHeight,
  tight,
  rounded,
  type,
  textStyle,
  borderRadius: propBorderRadius,
  backgroundColor: propBackgroundColor,


  initial
  animationDuration
  options: label, value, activeColor, disableValueChangeOnPress
**/

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

    let value = 0;
    if (this.props.initial) {
      if (I18nManager.isRTL) {
        value = -(this.props.initial / this.props.options.length);
      } else {
        value = this.props.initial / this.props.options.length;
      }
    }
    this.animatedValue = new Animated.Value(value);
  }

  componentWillMount() {
    this.panResponder = PanResponder.create({
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
    const { options } = this.props;
    return options[selected].activeColor || bgColor;
  }

  getSwipeDirection(gestureState) {
    const { dx, dy, vx } = gestureState;
    // 0.1 velocity
    if (Math.abs(vx) > 0.1 && Math.abs(dy) < 80) {
      return dx > 0 ? 'RIGHT' : 'LEFT';
    }
    return null;
  }

  responderEnd = (evt, gestureState) => {
    if (this.props.disabled) return;
    const swipeDirection = this.getSwipeDirection(gestureState);
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
      easing: Easing.out(Easing.ease),
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

  renderLabel = (element, index, fgColor, fgColorInverse) => {
    const { disabled, size, textStyle, selectedTextColor } = this.props;
    return (
      <TouchableOpacity
        key={index}
        disabled={disabled}
        style={styles.button}
        onPress={() => this.toggleItem(index)}
        activeOpacity={0.6}
      >
        <AwsmText
          weight={14}
          size={size}
          align='center'
          color={this.state.selected === index
                ? selectedTextColor || fgColor
                : fgColorInverse}
          style={textStyle}
        >
          {element.label}
        </AwsmText>
      </TouchableOpacity>
    );
  };

  render() {
    const {
      style,
      borderColor,
      borderWidth,
      size,
      buttonHeight,
      tight,
      rounded,
      type,
      options,
      borderRadius: propBorderRadius,
      backgroundColor: propBackgroundColor
    } = this.props;

    const { fgColor, bgColor, fgColorInverse } = colorPicker(type);
    const { fSize } = fontSizePicker(size);

    const height = tight ? (buttonHeight || fSize) * 2.2 : (buttonHeight || fSize) * 3;
    const borderRadius = rounded ? height / 2 : propBorderRadius;
    const backgroundColor = propBackgroundColor || fgColor;

    return (
      <View style={[{ flexDirection: 'row' }, style]}>
        <View {...this.panResponder.panHandlers} style={{ flex: 1 }}>
          <View
            style={{
              height,
              borderRadius,
              backgroundColor
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
                borderWidth,
                borderRadius
              }}
            >
              {!!this.state.sliderWidth && (
                <Animated.View
                  style={[
                    {
                      height,
                      borderRadius,
                      backgroundColor: this.getBgColor(bgColor),
                      width: this.state.sliderWidth / this.props.options.length,
                      transform: [{
                          translateX: this.animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, this.state.sliderWidth]
                          })
                        }]
                    },
                    styles.animated
                  ]}
                />
              )}
              {options.map((element, index) => (
                this.renderLabel(element, index, fgColor, fgColorInverse)
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  }
}

AwsmSelector.defaultProps = {
  borderRadius: BORDER_RADIUS,
  returnObject: false,
  animationDuration: 280,
  disabled: false,
  disableValueChangeOnPress: false
};
