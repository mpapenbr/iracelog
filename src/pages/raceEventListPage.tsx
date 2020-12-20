import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import RaceEventList from "../components/raceEventList";
import { loadRaceEvents } from "../stores/raceevents/actions";

interface IStateProps {}
interface IDispachProps {
  // loadEvents: () => any;
}
type MyProps = IStateProps & IDispachProps;

export const RaceEventListPage: React.FC<MyProps> = (props: MyProps) => {
  const [loadTrigger, setLoadTrigger] = useState(0);
  const dispatch = useDispatch();

  //const delegate = useCallback(() => dispatch(loadRaceEvents), [dispatch]);
  useEffect(() => {
    console.log("Now trigger load events");
    //delegate();
    dispatch(loadRaceEvents());
  }, [loadTrigger]);

  return <RaceEventList />;
};
