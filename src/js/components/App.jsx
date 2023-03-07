import React, { useContext, useEffect, useState, useRef, useReducer, memo, useCallback, useMemo, useLayoutEffect } from "react";
import UserInfoContext from "../client";

// memoでレンダリングを制御する
// React関数コンポーネントをmemo()でラップすると、
// コンポーネントをメモ（記憶）しておくことができる
// メモしたコンポーネントは不要な再レンダリングを行わなくなる（詳細は後述）
const Memo = memo(({ isLogin }) => {
  console.log('Memoが再レンダリングされました');
  return (
    <div>
      {isLogin}
    </div>
  )
})

const NoMemo = ({ isAuth }) => {
  console.log('NoMemoが再レンダリングされました');
  return (
    <div>
      {isAuth}
    </div>
  )
}

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
  // useEffect(() => {
  //   console.log('Hello, world!');
  //   console.log(`current count: ${count}`);
  // }, [count]);

  /* 詳解useEffect
    useEffectの本質
    1. 一般的には、ネットワークを介してデータを取得する処理を記述する
    2. 「レンダリング時にコードを実行するもの」ではなく、「再レンダリング時に不要なコードの実行をスキップする」
    3. クリーンアップ処理を適切に使うことで、useMemoとの差別化ができる

    クリーンアップ処理とは？
    useEffectが実行される直前またはアンマウント時に実行されるもの
    setTimeout, setInterval, APIリクエストなどをキャンセルする目的で使われる
    これにより無駄なメモリ使用を防止しパフォーマンスを向上させることができる

    コンポーネントのライフサイクル
    Reactにおいてはコンポーネントがマウントされてからアンマウントされる時までを指す
    アンマウントとはビューからDOMを取り除くことを指す

    アンマウントとはなにか？
    ページからコンポーネントが消えた（Unmount）されること
    マウント解除と表現されることもある
    とにかくコンポーネントが画面から取り除かれた際の処理のこと
    useEffectではアンマウントをフックにしてクリーンアップ処理を実行することができる

    クリーンアップ関数は、onUnmountにフックして実行される
    onSubmitイベントでsubmitイベントの前にコールバックが実行されるような感じ

    クリーンアップ処理が正確にいつ実行されるかは、仮想DOMから削除される時（アンマウント）しか保証されていない。
    再レンダリングがあっても、前回のuseEffectで登録されたクリーンアップ関数は、次のuseEffectが呼び出されるまで実行されない

    ＊公式ドキュメント
    >> レンダリング後にコードを実行できるため、コンポーネントをReact外部のシステムと同期させることができます。
  */

  // 問: APIを叩いてデータフェッチするだけならuseEffectなくてもいいのでは？
  // useEffectを使わずにAPIを叩いてデータをstateに保存するとする
  // console.log('fetch from Network API');
  // setCount(count + 1);
  // →Too Many re-renders（無限ループ発生）
  // →初回レンダリング→state更新→state更新を受けて再レンダリング→state更新→...以降無限ループ

  // この問題を解決するためにuseEffectが使える
  // 初回レンダリングのときだけ実行するようになり、無限ループが発生しなくなった
  // つまり、useEffectの本質は
  // 「レンダリング時にコードを実行する」ではなく、
  // 「再レンダリング時に不要なコードの実行をスキップするもの」といえる
  // useEffect(() => {
  //   console.log(`fetch from Network API in useEffect`);
  //   console.log(`current count: ${count}`);
  //   setCount(count + 1);
  // }, []);

  // 問: スキップするだけならuseMemoでもいい？
  // →正しい
  // →useMemoは「再レンダリング時にコードの実行結果をキャッシュするもの」であるが、
  //   本質的にはuseEffectと同じである
  //   ただしuseEffectとは実行のタイミングが大きく異なる

  // useMemoの挙動をよく観察する
  // →子コンポーネント（Memo, NoMemo）がレンダリングされる前に関数が実行された
  // →さらに、state更新を受けてコンポーネントの再レンダリングは行われなかった
  // →だがsetCountでstateの値は更新されていた
  // →一方で、useEffectはコンポーネントの初回レンダリング後に同期的に実行されていた
  // →そして、state更新を受けてコンポーネントの再レンダリングが行われた
  // 【結論】
  // ・useEffectはコンポーネントのレンダリング後に同期的に実行される（副作用）
  // ・useEffectでstateを更新すると、再レンダリングが行われる
  // ・useMemoは「コンポーネントのレンダリング前」に関数が実行される
  // ・useMemoでstateは内部的に更新されるが、コンポーネントの再レンダリングはスケジューリングされない
  // useMemo(() => {
  //   console.log('fetch from Network API in useMemo');
  //   console.log(`current count: ${count}`);
  //   if (count < 3) setCount(count + 1);
  // }, [count]);

  // 上記useEffect, useMemoを実行した場合の結果
  // 1. useMemoが実行される（count = 0）
  // 2. count更新を受けてuseMemoが再発火する（count = 1）
  // 3. useMemo4回目でcount = 3を出力し、再発火ループを抜ける
  // 4. コンポーネントの初回レンダリングが行われる
  // 5. 1つ目のuseEffectでHello Worldが実行される(初回レンダリングに同期、countに依存)
  // 6. 2つ目のuseEffectでfetch from Network API in useEffectを出力する（初回レンダリングに同期、依存配列なし）
  //    current count: 3を出力する
  //    countを更新する
  // 7. count更新を受けて、コンポーネントの再レンダリングがスケジューリングされる
  // 8. count更新を受けて、useMemoがコンポーネントの再レンダリングの前に実行される
  //    メッセージとcount = 4を出力する
  //    →6.のuseEffectのcount更新が反映されている
  // 9. コンポーネントの再レンダリングが行われる
  // 10. 6. のcount更新を受けて、1つ目のuseEffectが実行される
  //     2回目のレンダリングに同期して実行される
  //     メッセージとcount = 4を出力する
  // 【ポイント】
  // 手順1 〜 3、 8から、
  // ・useMemoは常にレンダリングの前に実行される。
  // ・依存するstateが更新された場合もレンダリングの直前に実行される
  // ・仮にuseMemoでstate更新ループが発生しても、すべて（そのstate更新でスケジュールされた）レンダリングの前に実行される
  // 手順5 〜 6、10から、
  // ・useEffectは必ず初回/再レンダリングに同期的に実行される
  // ・再レンダリングでは、依存するstateがあれば実行されて、なかったらスキップされる
  // 共通
  // ・発火が決定したuseMemo、useEffectは基本的に上から実行される

  // クリーンアップの挙動を確かめる
  // ケース①
  // 依存配列が空で、クリーンアップ関数が登録されているだけ
  // →これはコンポーネントがアンマウントされた時だけ実行されるらしい
  // →...ところが、これを実行させる方法が分からない
  // →clickでstateの更新ではだめだった（当然だが）
  useEffect(() => {
    // マウント時に実行
    return () => {
      // アンマウントされる度にクリーンアップ処理を実行
      console.log('Unmounting component');
    }
  }, []);
  // ケース②
  // 依存配列があり、マウント時の処理をオフにしている
  // 1. 初回レンダリング（マウント）
  // 2. 初回useEffect実行
  // 3. alert()実行
  // 4. 古いクリーンアップ関数が登録される
  // →後ほど出力されるcountの値が0であることがエビデンス
  // 5. clickでstateを更新
  // 6. 再レンダリング
  // 7. アンマウント
  // 8. 古いクリーンアップ関数が実行される
  // 9. 2回目のuseEffect実行
  // 10. alert実行
  // 11. 新しいクリーンアップ関数が登録される
  useEffect(() => {
    // document.title = `You clicked ${count} times`;
    // alert();
    return () => {
      console.log('clean up');
      document.title = "React App";
      console.log(count);
    }
  }, [count]);

  // useLayoutEffect
  // useEffectとほとんど同じだが、実行されるタイミングが違う
  // useEffectは仮想DOMが構築されてレンダリングされたあとに実行されるが、
  // useLayoutEffectは仮想DOMが構築されてレンダリングされる前に実行される
  // あまりにも重たい処理を書くと画面描画が遅れてしまう可能性がある
  // 【実行順序検証用】
  // 1. useMemo・・・仮想DOM構築前？
  // 2. useLayoutEffect・・・仮想DOM構築後、レンダリングの直前
  // 3. useEffect・・・レンダリング後
  useLayoutEffect(() => {
    console.log('Layout Effect');
    return () => {
      console.log('hoge')
    }
  }, [count]);

  useEffect(() => {
    console.log('useEffect');
  }, []);

  useMemo(() => {
    console.log('useMemo');
  }, []);

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

  const [isLogin, setIsLogin] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  // メモ化していない関数を子孫コンポーネントに渡してしまうと、
  // 無駄な再レンダリングの温床となる
  const onClick = () => {
    console.log('clicked!');
  }

  // useCallbackは第一引数にメモ化したい関数を、第二引数に依存配列を指定する
  // 関数の再描画が行われる度に、依存配列の中の値が前回と変更がないか検知する
  // それぞれ前回の値と同じであれば、useCallbackは現在メモ化している第一引数の関数を返す
  // 異なる値があれば、現在の第一引数の関数のバージョンをメモ化する
  // したがって、依存配列が変化する度に新しい関数が作成されるので、より柔軟に再描画を制御することができる
  // 依存配列の中身が空であれば、常に同じメモ化された関数を返すことができる
  const onClickWithUseCallback = useCallback(() => {
    // propsを受け取って自分で実行しない限り、コンソールに出力されることはない
    console.log('clicked! with useCallback()');
  }, []);

  // useMemoは値をメモ化する
  // 第一引数にメモ化したい値を返す関数を、第二引数に依存配列を指定する
  // useCallbackと同様にuseMemoが再描画される度に依存配列の値の変化をチェックする
  // 値が同じであれば、第一引数の関数は実行されず、メモしている値を返す
  // 異なる値があれば、第一引数の関数を実行し、その結果を新しい値としてメモ化する
  // useCallbackとの違いをもう少し深堀りすると、
  // ・useCallbackはメモ化した"関数"を返し、関数を実行しない
  // ・useMemoはメモ化した"値"を返し、それは"関数を実行"することで得られる
  const onClickWithUseMemo = useMemo(() => {
    // 初回マウント時のみ実行されて、コンソールに出力される（依存配列を空にした場合）
    console.log('clicked! with useMemo()');
    return {
      music: "classic",
      name: "悲愴"
    }
  }, []);

  // useRefを使って再レンダリングを制御する
  // 親コンポーネントが再描画された際の子孫コンポーネントへの再描画の伝搬は、
  // ミュータブルなオブジェクトが再描画される度に新しいものが生成されることが原因だった
  // useMemoやuseCallbackの再描画制御の仕組みは、これの同じものをメモするというもの
  // ならば、useRefで同じオブジェクトへの参照を作ることでも、メモ化できると考えられる
  const onClickRef = useRef(() => {
    console.log('clicked! with useRef()');
  });
  // const onClickRef = useRef(onClick);

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

      <div>
        <h1>memo, useCallback, useMemo</h1>
        {/*
            最初のbuttonを押すとMemoとNoMemoの両方が再レンダリングされる
            しかし、2番目のbuttonを押した場合は再レンダリングされるのはNoMemoだけとなる
            これはMemoコンポーネントをmemo()でラップしているからである

            これを理解するにはReactコンポーネントの再レンダリングのタイミングについて理解しておく必要がある
            1. propsやstateなどの内部状態が更新されたとき
            2. 親コンポーネントが再レンダリングされたとき
            3. コンポーネントで参照しているContextの値が更新されたとき

            注目すべきは2番目で親コンポーネントが再レンダリングされると、
            その子孫コンポーネントはすべて無条件に再レンダリングされるという点である
            これを防ぐのがmemo()でラップしたメモ化コンポーネントである
            メモ化コンポーネントはpropsやstateやcontextの値が変化した場合を除いて、
            親コンポーネントが再レンダリングされたことによる再描画の伝搬を解除することができる

            最初のbuttonではメモ化コンポーネントであるMemoが、
            親コンポーネントのisLoginの変更を検知したために再レンダリングされた
            一方で2番目のbuttonではisAuthをMemoが参照していなかったため、
            親コンポーネントの再レンダリングが発生しても再描画の伝搬が発生しなかった

            ----------例外----------

            memo()でメモ化したコンポーネントにpropsで関数やオブジェクトや配列を渡すと、
            再び親コンポーネントが再レンダリングされたことによる再描画の伝搬の影響を受けてしまう
            これは親コンポーネントが再描画される度に新しく作られたオブジェクトが
            子孫コンポーネントに渡されるためである

            つまりプリミティブ型のpropsはイミュータブルであり不変の値なので
            親コンポーネントが再描画されても参照するpropsが更新されていなければ（メモリ上で新しい値が作成されなければ）
            メモ化コンポーネントまで再描画が伝搬することはないが、
            オブジェクト型のpropsはミュータブルであるため
            親コンポーネントが再描画されると新しく作られたオブジェクトがpropsとして渡されてしまい
            メモ化コンポーネントはpropsが更新されたと検知してしまい再描画の発生を抑制できなくなる

            これを防ぐためにuseCallbackやuseMemoなどのフックが使える
        */}
        <div>
          <button onClick={ () => setIsLogin(!isLogin) }>Memoのstate isLogin を切り替える</button>
          <button onClick={ () => setIsAuth(!isAuth) }>NoMemoのstate isAuth を切り替える</button>
        </div>
        {/* <Memo isLogin={ isLogin } />
        <NoMemo isAuth={ isAuth } /> */}

        {/* ミュータブルなpropsを渡すと再レンダリングが発生してしまう */}
        {/* <Memo isLogin={ isLogin } onClick={ onClick } />
        <NoMemo isAuth={ isAuth } onClick={ onClick } /> */}
        {/* <Memo isLogin={ isLogin } properties={ { music: 'classic', name: 'G線上のアリア' } } />
        <NoMemo isAuth={ isAuth } properties={ { music: 'classic', name: 'ノクターン' } } /> */}
        {/* <Memo isLogin={ isLogin } alphabets={['a', 'b', 'c']} />
        <NoMemo isAuth={ isAuth } alphabets={['a', 'b', 'c']} /> */}

        {/* useCallbackは依存配列を空にすると常に同じバージョンの関数を返す */}
        {/* useCallbackで関数をメモ化すると再レンダリングを抑制することができる */}
        {/* <Memo isLogin={ isLogin } onClick={ onClickWithUseCallback } />
        <NoMemo isAuth={ isAuth } onClick={ onClickWithUseCallback } /> */}

        {/* useMemoは値をメモする */}
        {/* オブジェクト、関数、配列などを扱って再レンダリングを制御したい場合はこちらを使う */}
        {/* <Memo isLogin={ isLogin } onClick={ onClickWithUseMemo } />
        <NoMemo isAuth={ isAuth } onClick={ onClickWithUseMemo } /> */}

        <Memo isLogin={ isLogin } onClick={ onClickRef.current } />
        <NoMemo isAuth={ isAuth } onClick={ onClickRef.current } />
      </div>
    </>
  );
};

export default App;
