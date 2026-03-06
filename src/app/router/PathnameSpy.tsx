import { useLocation } from "react-router-dom"

const PathnameSpy = () => {
  const location = useLocation()
  return (
    <p data-testid="pathname">{location.pathname}</p>
  )
}
export default PathnameSpy
