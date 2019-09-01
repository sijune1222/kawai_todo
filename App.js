import React from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    StatusBar, 
    TextInput, 
    Dimensions, 
    Platform,
    ScrollView,
    AsyncStorage 
  } from 'react-native'; 
//Statusbar, TextInput 추가
import { AppLoading } from "expo";
import ToDo from "./ToDo";
import uuidv1 from "uuid/v1";


const { height, width } = Dimensions.get("window")

export default class App extends React.Component{
  state = {
    newToDo:"",
    loadedToDos: false, //지금은 false지만
    toDos: {}
  };

  componentDidMount = () => {
    this._loadToDos();
  }

  render() {
    const { newToDo, loadedToDos, toDos } = this.state;
    if(!loadedToDos){
      return <AppLoading />; //Apploading -> componentDidMount -> _loadToDos -> loadedToDos를 true로 변경 -> 실제 밑에 있는 코드 show : 앱로딩 화면 후 실제 코드를 띄우겠다.
    }
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.title}>Kawai To Do</Text>
        <View style={styles.card}>
          <TextInput 
            style={styles.input} 
            placeholder={"New To Do"} 
            value={newToDo}
            onChangeText={this._controlNewToDo}
            placeholderTextColor={"#999"}
            onSubmitEditing={this._addToDo} //완료를 클릭할 때 
            underlineColorAndroid={"transparent"}
          />
          <ScrollView contentContainerStyle={styles.toDos}> 
            {Object.values(toDos).reverse().map(toDo => <ToDo key={toDo.id} 
                                                    {...toDo} 
                                                    deleteToDo={this._deleteToDo}
                                                    uncompleteToDo={this._uncompleteToDo}
                                                    completeToDo={this._completeToDo}
                                                    updateToDo={this._updateToDo}
                                     />)} 
            {/* 오브젝트를 맵핑하는 방법 */}
          </ScrollView>
        </View>
      </View>
    );
  }
  
  //글을 작성하게 해주는 함수
  _controlNewToDo = text => {
    this.setState({
      newToDo: text
    });
  };

  //로드가 다 되었을 때, true로 값 변경
  _loadToDos = async () => { 
    try{
      const toDos = await AsyncStorage.getItem("toDos"); //동기적으로 처리하기 위해서: async, await
      const parsedToDos = JSON.parse(toDos);
      //loadToDos를 true로 바꿔주는 코드
      this.setState({
        loadedToDos: true,
        toDos: parsedToDos || {} //오브젝트는 null이라는 키를 받을 수 없다. 따라서 || {} 추가
        //디스크에서 얻은 것을 state로 넣어버린다.
        //앱이 종료되고 다시 실행되어도 다시 데이터를 불러온다.
      })
    }catch(err){
      console.log(err)
    }
  }
  //텍스트 박스에서 완료 버튼을 눌렀을 때
  _addToDo = () => {
    const { newToDo } = this.state;

    if(newToDo !==""){
      this.setState(prevState => {
        const ID = uuidv1();
        const newToDoObject = {
          [ID]: { //변수를 name으로 설정하는 방법
            id: ID,
            isCompleted: false,
            text: newToDo,
            createdAt: Date.now()
          }
        }
        const newState = {
          ...prevState, //기존 State와
          newToDo: "", //newToDo를 비워버린 것과
          toDos: { //기존 + 새로운 toDo 모두
            ...prevState.toDos,
            ...newToDoObject //열거형 프로퍼티를 가져올때 ,...를 쓴다.
          }
        }
        this._saveToDos(newState.toDos); //state가 아니라 toDos를 저장하고 싶다.
        return {...newState} //리턴한다.
      })
    }
  }

  _deleteToDo = (id) => {
    this.setState(prevState=>{
      const toDos = prevState.toDos;
      delete toDos[id];
      const newState = {
        ...prevState,
        ...toDos
      };
      this._saveToDos(newState.toDos); //state가 아니라 toDos를 저장하고 싶다.
      return {...newState};
    })
  }
  _uncompleteToDo = (id) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: false //계속 오버로드 된다.
          }
        }
      }
      this._saveToDos(newState.toDos); //state가 아니라 toDos를 저장하고 싶다.
      return {...newState}
    })
  }
  _completeToDo = (id) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: true //계속 오버로드 된다.
          }
        }
      }
      this._saveToDos(newState.toDos); //state가 아니라 toDos를 저장하고 싶다.
      return { ...newState }
    })
  }
  _updateToDo = (id, text) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            text: text //계속 오버로드 된다.
          }
        }
      }
      this._saveToDos(newState.toDos); //state가 아니라 toDos를 저장하고 싶다.
      return { ...newState }
    })
  }
  _saveToDos = newToDos => {
    const saveToDos = AsyncStorage.setItem("toDos", JSON.stringify(newToDos)) 
    //JSON은 글로벌 오브젝트 
    //toDos가 key, newToDos가 value
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F23657',
    alignItems: 'center',
  },
  title: {
    color: "white",
    fontSize: 30,
    marginTop: 50,
    fontWeight: "200",
    marginBottom: 30
  },
  card: {
    backgroundColor: "white",
    flex: 1,
    width: width - 25, 
    //width전체를 선택하는 코드가 있다. :const { height, width } = Dimensions.get("window")
    borderTopLeftRadius:10,
    borderTopRightRadius: 10,
    ...Platform.select({ //플랫폼마다 적용하는 스타일 속성이 다를 때 사용
      ios:{
        shadowColor: "rgb(50, 50, 50)",
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowOffset:{
          height: -1,
          width: 0
        }
      },
      android: {
        elevation: 3
      }
    })
  },
  input:{
    padding: 20,
    borderBottomColor: "#bbb",
    borderBottomWidth: 1,
    fontSize: 25,

  },
  toDos:{
    alignItems: "center"
  }
});
