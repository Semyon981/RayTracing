#include <iostream>
#include <SFML/Graphics.hpp>
#include <windows.h>
#include <math.h>
#include <random>
using namespace std;
using namespace sf;
#define PI 3.14159265


int main()
{
    ContextSettings settings;
    settings.depthBits = 32;
    settings.stencilBits = 8;
    settings.antialiasingLevel = 0;
    settings.majorVersion = 3.3;
    settings.minorVersion = 3.3;
    settings.sRgbCapable = 0;
    int widthr = GetSystemMetrics(SM_CXSCREEN);
    int heighr = GetSystemMetrics(SM_CYSCREEN);
    int width = 800;
    int heigh = 600;
    //int width = widthr;
    //int heigh = heighr;
    float mnojitel = float(width) / float(heigh);


    RenderWindow window(VideoMode(width, heigh), "MYMY", Style::Default, settings);
    window.setVerticalSyncEnabled(true);
    window.setActive(true);
    Shader shader;
    shader.loadFromFile("sh1.frag", Shader::Fragment);
    shader.setUniform("resol", Vector2f(width, heigh));

    window.setPosition(Vector2i(widthr / 2 - width / 2, heighr / 2 - heigh / 2));





    RectangleShape rectangle(Vector2f(width, -heigh));

    rectangle.move(0, heigh);
    rectangle.setFillColor(Color(255, 0, 0));
    ShowCursor(0);

    float AngleX = 0;
    float AngleZ = 0;
    float sensivity = 0.45;
    Vector3f pos = Vector3f(0, 0, 0.2);

    Clock clock;
    float time;

    clock.restart();

    std::random_device rd;
    std::mt19937 e2(rd());
    std::uniform_real_distribution<> dist(0.0f, 1.0f);
    while (window.isOpen())
    {
        Event event;
        while (window.pollEvent(event))
        {
            if (Keyboard::isKeyPressed(Keyboard::Escape))
            {
                window.close();
            }
            if (event.type == sf::Event::Closed)
            {
                window.close();
            }
        }

        time = clock.getElapsedTime().asMicroseconds() / 3000;
        clock.restart();
        //cout << time << endl;



        POINT p;
        GetCursorPos(&p);


        //cout << p.x << " " << p.y << endl;
        float mdx = widthr / 2 - p.x;
        float mdy = heighr / 2 - p.y;

        AngleZ += -mdx / 6;
        if (AngleX > -89 && AngleX < 89)
        {
            AngleX += mdy / 6;
        }
        else
        {
            if (AngleX <= -89)
            {
                if (mdy > 0)
                {
                    AngleX += mdy / 6;
                }
                else
                {
                    AngleX = -89;
                }
            }
            else if (AngleX >= 89)
            {
                if (mdy < 0)
                {
                    AngleX += mdy / 6;
                }
                else
                {
                    AngleX = 89;
                }
            }

        }
        if (Keyboard::isKeyPressed(Keyboard::W))
        {
            pos.x += sin(AngleZ / 180 * PI) * 0.01;
            pos.y += cos(AngleZ / 180 * PI) * 0.01;
        }
        if (Keyboard::isKeyPressed(Keyboard::A))
        {
            pos.x += sin((AngleZ - 90) / 180 * PI) * 0.01;
            pos.y += cos((AngleZ - 90) / 180 * PI) * 0.01;
        }
        if (Keyboard::isKeyPressed(Keyboard::S))
        {
            pos.x += sin((AngleZ - 180) / 180 * PI) * 0.01;
            pos.y += cos((AngleZ - 180) / 180 * PI) * 0.01;
        }
        if (Keyboard::isKeyPressed(Keyboard::D))
        {
            pos.x += sin((AngleZ + 90) / 180 * PI) * 0.01;
            pos.y += cos((AngleZ + 90) / 180 * PI) * 0.01;
        }
        if (Keyboard::isKeyPressed(Keyboard::LShift))
        {
            pos.z += 1 * 0.01;
        }
        if (Keyboard::isKeyPressed(Keyboard::LControl))
        {
            pos.z += -1 * 0.01;
        }
        //cout << x << " " << y << endl;
        //cout << AngleZ << " " << AngleX << endl;
        Vector3f dir = Vector3f(sin(AngleZ / 180 * PI) * cos(AngleX / 180 * PI), cos(AngleZ / 180 * PI) * cos(AngleX / 180 * PI), sin(AngleX / 180 * PI));

        
        shader.setUniform("dir", dir);
        shader.setUniform("pos", pos);  
        shader.setUniform("u_seed1", sf::Vector2f((float)dist(e2), (float)dist(e2)) * 999.0f);
        shader.setUniform("u_seed2", sf::Vector2f((float)dist(e2), (float)dist(e2)) * 999.0f);
        SetCursorPos(widthr / 2, heighr / 2);


        window.draw(rectangle, &shader);
        window.display();
    }




    return 0;
}