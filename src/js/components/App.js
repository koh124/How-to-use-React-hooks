import React, { useContext, useEffect, useState, useRef, useReducer } from "react";
import UserInfoContext from "../client";

const App = () => {
  // let count = 0;

  // stateの管理をするためにuseState()を使う
  // 引数には初期値を渡す
  // useState()の戻り値は配列になっていて、[stateの初期値, セッター]になっている
  // javascriptの分割代入でこれらを代入している
  const [count, setCount] = useState(0);

  // クリックするごとにcountが増える
  // ブラウザ内部の変数は変わっているが、レンダリングされてはいないため、表示は0のまま
  const handleClick = () => {
    // count++;
    // console.log(count);

    // stateの更新はセッターを通して行う
    // stateを更新すると、DOMの再レンダリングが行われる
    // 直接count++をしてもstateのレンダリングはされない
    setCount(count + 1);
  }

  // 更新関数に関数を渡すことでuseStateの値を更新することもできる
  // 更新関数の引数には現在のstateが渡されて、戻り値が次の状態になる
  const handleCountMinus = () => {
    setCount((prevCount) => prevCount - 1 );
  }

  /* ※※※※※ DOMの再レンダリングはどのように行われるのか？ ※※※※※
  Reactは仮想DOM（バーチャルDOM）という仕組みを使っている
  仮想DOMは実際のDOMを仮想的に構築しているが、まだ反映されていない状態のもの
  Reactは実際のブラウザの環境であるDOM、変更前のVDOM、変更後のVDOM、
  これら3つのDOMを常に監視している
  仮想DOMに変化があったとき、それを実際のDOMに反映する

  仮想DOMを使うことのメリットは、レンダリングの効率の良さにある
  仮想DOMの変更前と変更後の差分を見ることで、差分があった部分だけをレンダリングすればよいことになる
  仮想DOMを使わない場合はDOMを一から再構築していたので、遥かにパフォーマンスがアップする
  */

  // useEffectでは副作用をつけることができ、発火のタイミングを決めることができる
  // 第2引数で発火のタイミングを指定できる
  // 空の配列[]を渡すと、ページをリロードしたときに（マウントされたときに）発火するようになる
  // 配列にstate変数を入れて渡すと、stateが更新されたときに発火するようになる
  useEffect(() => {
    console.log('Hello, world!')
  }, [count]);

  // useContext
  // useContextはReduxという考え方に近い
  // コンポーネントの受け渡しはネスト構造になりがちで、入れ子がかなり複雑になりやすい
  // propsを経由してデータを子コンポーネントまでバケツリレーすると、かなりコードが煩雑になる
  // useContextを使うと、最上位のコンポーネントからどのコンポーネントにも1手でデータを受け渡しできるようになる
  // useContextはユーザーの認証状態など、どのコンポーネントでも使う情報をグローバルで共有したい場合に便利
  const userinfo = useContext(UserInfoContext);

  // useRef
  // useRefは指定したDOMへの参照を作成することができる
  const ref = useRef();

  // DOMへの参照を見ることができる
  const handleRef = () => {
    console.log(ref);
  };

  /*
  useReducer
  useReducerはuseStateのように状態を扱うためのもう一つのフック
  複雑な状態遷移をシンプルに記述することができる
  配列やオブジェクトを状態として扱う場合に用いられる場合が多い
  useStateよりも複雑な用途に向いている
  */
  // reducer (現在の状態, dispatchから渡されるaction): 次の状態 {}
  const reducer = (currentCount, action) => {
    switch (action) {
      case "Increment":
        return currentCount + 1;
      case "Decrement":
        return currentCount - 1;
      case "Double":
        return currentCount * 2;
      case "Reset":
        return 0;
      default:
        return currentCount;
    }
  }
  // const [現在の状態, dispatch] = useReducer(reducer, 初期状態)
  const [_count, dispatch] = useReducer(reducer, 0);
  const dispatcher = (event) => {
    // dispatchにactionを渡す
    dispatch(event.target.value);
  }

  return (
    <>
      <div>
        <h1>useState, useEffect</h1>
        <button onClick={handleClick}>＋</button> {/* クリックすると＋1 */}
        <button onClick={handleCountMinus}>−</button>
        <p>{count}</p>
      </div>

      <div>
        <h1>useContext</h1>
        <p>{userinfo.name}</p>
        <p>{String(userinfo.is_admin)}</p>
        <p>{String(userinfo.is_auth)}</p>
      </div>

      <div>
        <h1>useRef</h1>
        <input type="text" ref={ref} />
        <button onClick={handleRef}>useRef</button> {/* クリックするとinputタグに入力した内容などを見ることができる */}
      </div>

      <div>
        <h1>useReducer</h1>
        <input onClick={ dispatcher } type="button" value="Increment" />
        <input onClick={ dispatcher } type="button" value="Decrement" />
        <input onClick={ dispatcher } type="button" value="Double" />
        <input onClick={ dispatcher } type="button" value="Reset" />
        <p>{_count}</p>
      </div>
    </>
  );
};

export default App;
