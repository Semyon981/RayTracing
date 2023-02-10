#version 330
uniform vec2 resol;
uniform vec3 dir;
uniform vec3 pos;
out vec4 fragColor;

vec3 sph = vec3(0,0,0);
vec3 plane = vec3(0,0,0);
vec3 light = normalize(vec3(1,-0.5,1));
vec2 sphIntersect( in vec3 ro, in vec3 rd, float ra )
{
    
    float b = dot( ro, rd );
    float c = dot( ro, ro ) - ra*ra;
    float h = b*b - c;
    if( h<0.0 ) return vec2(-1.0,-1.0);
    h = sqrt( h );
    return vec2( -b-h, -b+h );
}
float plaIntersect( in vec3 ro, in vec3 rd, in vec4 p )
{
    return -(dot(ro,p.xyz)+p.w)/dot(rd,p.xyz);
}
vec4 castRay(vec3 ro,vec3 rd)
{
	vec3 color1 = vec3(pow(1,0.45),pow(0.2,0.45),pow(0.1,0.45));
	vec3 color2 = vec3(pow(0.4,0.45),pow(0.6,0.45),pow(0.8,0.45));
	vec3 color;
	float minr = -1;
	vec2 it = sphIntersect(ro-sph,rd,1);	
	vec3 n;
	if(it.x <= 0)
	{
		minr = it.x;
	}
	else
	{		
		vec3 itPos = ro-sph + rd*it.x;
	    n = itPos;
		minr = it.x;
		color = color1;
	}
	
	vec3 nPlane = vec3(0,0,1);
	float itPlane = plaIntersect(ro-plane,rd,vec4(nPlane,1));
	if(itPlane<=0)
	{
		if(minr<=0)
		{
			return vec4(-1,-1,-1,-1);
		}
	}
	else
	{
		if(minr<=0)
		{
			n = nPlane;
			minr = itPlane;
			color = color2;
		}
		else
		{
			if(itPlane<minr)
			{
				n = nPlane;
				minr = itPlane;
				color = color2;
			}
		}		
	}
	
	float diffuse = max(0.0,dot(light,n))*0.5;
	float specular = pow(max(0.0,dot(reflect(rd,n),light)),16);
	return vec4(vec3(diffuse+specular)*color,minr);
	
}

vec3 traceRay(vec3 ro, vec3 rd)
{
	vec4 col = castRay(ro,rd);
	if(col.w < 0)		
		return vec3(0.0);	
	/*if(castRay(ro+rd*col.w,light).w != -1)
	{	
		col+=100;	
	}*/
	return col.xyz;
	
	
}



void main()
{
	
	
	
	vec2 uv = (gl_FragCoord.xy - resol/2)/resol.y;
	vec3 rayOrigin = pos;
	vec3 dir2 = normalize(dir);
	vec3 vX = normalize(cross(dir2,vec3(0,0,1)));
	vec3 vZ = normalize(cross(vX,dir2));
	vec3 rayDirection = normalize(dir2+vX*uv.x+vZ*uv.y);
	vec3 col = traceRay(rayOrigin,rayDirection);
	
	
	fragColor = vec4(col,1);
	
	

}