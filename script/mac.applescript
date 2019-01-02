property fileTypes : {{«class PNGf», ".png"}}

on getType()
	repeat with aType in fileTypes
		repeat with theInfo in (clipboard info)
			if (first item of theInfo) is equal to (first item of aType) then return aType
		end repeat
	end repeat
	return missing value
end getType

on run argv
	if argv is {} then
		return ""
	end if
	
	set theType to getType()
	if theType is missing value then
		return "no image"
	end if
	
	set imagePath to (item 1 of argv)
	try
		set myFile to (open for access imagePath with write permission)
		set eof myFile to 0
		write (the clipboard as (first item of theType)) to myFile
		close access myFile
		return (POSIX path of imagePath)
	on error
		try
			close access myFile
		end try
		return ""
	end try
end run