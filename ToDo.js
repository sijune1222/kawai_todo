import React, {Component} from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, TextInput } from "react-native";
import PropTypes from "prop-types";

const {width, height} = Dimensions.get("window")

export default class ToDo extends Component{
    constructor(props){ //컴포넌트가 렌터될 대 자동으로 호출 
        super(props);
        this.state = {isEditing:false, toDoValue: props.text};
    }
    static propTypes = { //property 체크
        //static propTypes를 이용해 부모 컴포넌트에게서 받는 정보를 체크한다. 
        text: PropTypes.string.isRequired,
        isCompleted: PropTypes.bool.isRequired,
        deleteToDo: PropTypes.func.isRequired,
        id: PropTypes.string.isRequired,
        uncompleteToDo: PropTypes.func.isRequired,
        completeToDo: PropTypes.func.isRequired,
        updateToDo: PropTypes.func.isRequired
    }
    // state={
    //     isEditing: false,
    //     //isCompleted: false,
    //     toDoValue: ""
    // };
    render(){
        const { isEditing, toDoValue}  = this.state; //스타일 적용을 위해 끌어온다. == const isCompleted = this.state.isCompleted
        const { text, id, deleteToDo, isCompleted } = this.props; //isCompleted를 App.js에서 받는다.
        
        return(
            <View style={styles.container}>
                <View style={styles.column}>
                    <TouchableOpacity onPress={this._toggleComplete}>
                        <View style={[  //멀티플 스타일 적용하고자 할때
                            styles.circle,
                            isCompleted ? styles.completedCircle : styles.uncompletedCircle
                        ]} />
                    </TouchableOpacity>

                    {/* isEditing이 true면 textinput을 false면 text를 보여준다. */}
                    {isEditing ? (
                        <TextInput 
                            style={[styles.text, styles.input, isCompleted ? styles.completedText : styles.uncompletedText]} 
                                value={toDoValue} 
                                multiline={true}
                                onChangeText={this._controlInput} //onChangeText를 구현하는 함수는 매개변수 필요
                                onBlur={this._finishEditing}
                                // input바깥을 누르면 finish된다.
                                underlineColorAndroid={"transparent"}
                            />
                    ) : (
                        <Text style = {
                        [
                            styles.text,
                            isCompleted ? styles.completedText : styles.uncompletedText
                        ]
                        } >{ text }</Text>
                    )}
                </View>
                    
                    {/* 두가지 액션이 존재: 수정할 때(체크), 수정 안 할때(연필, 엑스)  */}
                    {isEditing ? 
                        <View style={styles.actions}>
                        <TouchableOpacity onPressOut={this._finishEditing}>
                                <View style={styles.actionContainer}>
                                    <Text style={styles.actionText}>✔</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        : <View style={styles.actions}>
                            <TouchableOpacity onPressOut={this._startEditing}>
                                <View style={styles.actionContainer}>
                                    <Text style={styles.actionText}>🖊</Text>
                                </View>
                            </TouchableOpacity>
                        <TouchableOpacity onPressOut={ event => {
                            event.stopPropagation; //toggle을 누를 때, 스크롤 뷰로 이벤트가 전파되는 것을 막는다.
                            deleteToDo(id)
                        }}> 
                                {/* this.deleteToDo(id)를 쓰면 안됨-> 이미 deleteToDo로 받고 있기 때문에 */}
                                <View style={styles.actionContainer}>
                                    <Text style={styles.actionText}>❌</Text>
                                </View>
                            </TouchableOpacity>
                        </View>}
            </View>
        );
    }
    

    //이부분도 startEditing처럼 두 파트로 나눠서 할 수 있지만, 그러면 프로그램이 너무 복잡해 진다.
    _toggleComplete = event => {
        event.stopPropagation(); //toggle을 누를 때, 스크롤 뷰로 이벤트가 전파되는 것을 막는다.
        const { isCompleted, uncompleteToDo, completeToDo, id} = this.props;
        if (isCompleted) {
            uncompleteToDo(id);
        } else {
            completeToDo(id);
        }
    };

    _startEditing = event => {
        event.stopPropagation(); //toggle을 누를 때, 스크롤 뷰로 이벤트가 전파되는 것을 막는다.
        this.setState({
            isEditing: true
        })
    }
    _finishEditing = event => {
        event.stopPropagation(); //toggle을 누를 때, 스크롤 뷰로 이벤트가 전파되는 것을 막는다.
        const {toDoValue} = this.state;
        const {id, updateToDo} = this.props;
        updateToDo(id, toDoValue);
        this.setState({
            isEditing: false
        })
    }

    // 글을 수정할 수 있게 해주는 함수
    _controlInput = (text) => {
        this.setState({
            toDoValue : text
        })
    }

}

const styles = StyleSheet.create({
    container: {
        width: width - 50,
        borderBottomColor: "#bbb",
        borderBottomWidth: StyleSheet.hairlineWidth,
        flexDirection: "row", //바로 옆에 위치하길 원한다.
        alignItems: "center",
        justifyContent: "space-between"
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 3,
        marginRight: 20
    },
    completedCircle:{
        borderColor: "#bbb"
    },
    uncompletedCircle: {
        borderColor: "#F23657"
    },
    text: {
        fontWeight: "600",
        fontSize: 20,
        marginVertical: 20
    },
    completedText: {
        color: "#bbb",
        textDecorationLine: "line-through"
    },
    uncompletedText: {
        color: "#353839"
    }
   ,
   column: {
       flexDirection: "row",
       alignItems: "center",
       width: width/2
   },
   actions: {
       flexDirection: "row"
   },
   actionContainer: {
       marginVertical: 10,
       marginHorizontal: 10
   },
   input: {
    marginVertical: 15,
    width: width / 2 ,
    paddingBottom: 5
   }
}); //스타일 시트 생성